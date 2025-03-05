from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from AI_SERVER import get_db_connection

@csrf_exempt
def tr_code_Collection(request):
    try:
        data = json.loads(request.body)
        tr_codes = data.get('tr_codes')  # [{'code': '007660', 'name': '삼성전자'}, ...]
        
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                # tr_codes 테이블 존재 여부 확인
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM information_schema.tables 
                    WHERE table_schema = 'test' 
                    AND table_name = 'tr_codes'
                """)
                tr_codes_exists = cursor.fetchone()[0] == 1
                
                if not tr_codes_exists:
                    # tr_codes 테이블 생성
                    cursor.execute("""
                        CREATE TABLE tr_codes (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            code VARCHAR(10) NOT NULL,
                            name VARCHAR(100) NOT NULL, 
                            certified boolean DEFAULT false,
                            current_inflection_count INT DEFAULT 0,  
                            previous_inflection_count INT DEFAULT 0, 
                            previous_peak_count INT DEFAULT 0, 
                            current_peak_count INT DEFAULT 0

                        )
                    """)
                
                # 테이블이 있는 경우 데이터 동기화
                cursor.execute("SELECT code FROM tr_codes")
                existing_codes = set(row[0] for row in cursor.fetchall())
                new_codes = {item['code']: item['name'] for item in tr_codes}  # 종목명과 함께 저장
                codes_to_delete = existing_codes - new_codes.keys()
                # (tr_codes에는 없지만 DB에는 있는 것)
                if codes_to_delete:
                    cursor.execute(
                        "DELETE FROM tr_codes WHERE code IN (%s)" % ','.join(['%s'] * len(codes_to_delete)),
                        tuple(codes_to_delete)
                    )
                
                    
                #  (tr_codes에는 있지만 DB에는 없는 것)
                codes_to_add = set(new_codes.keys()) - existing_codes
                for code in codes_to_add:
                    cursor.execute(
                        "INSERT INTO tr_codes (code, name) VALUES (%s, %s)",
                        (code, new_codes[code])  # 종목명도 함께 저장
                    )
                    
                connection.commit()
                    
                return JsonResponse({
                    'status': 'success',
                    'message': 'Data synchronized successfully',
                })
                    
        finally:
            connection.close()
            
    except Exception as e:
        print("에러 발생:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })
    
@csrf_exempt
def Stock_Data_Collection(request):
    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            code = data.get('code')
            stock_data = data.get('data')  # 리스트로 받음
            peak_dates = data.get('peak_dates')
            filtered_peaks = data.get('filtered_peaks')
            peak_prices = data.get('peak_prices')
            total_volume = sum(row['Volume'] for row in stock_data)
            total_weeks = len(stock_data)
            avg_daily_volume = ((total_volume / total_weeks) / 5) * 1.2
            connection = get_db_connection()
            try:
                with connection.cursor() as cursor:


                    # stock_data 테이블 존재 여부 확인
                    cursor.execute("""
                        SELECT COUNT(*)
                        FROM information_schema.tables 
                        WHERE table_schema = 'test' 
                        AND table_name = 'stock_data'
                    """)
                    stock_data_exists = cursor.fetchone()[0] == 1
                    
                    if not stock_data_exists:
                        # stock_data 테이블 생성
                        cursor.execute("""
                            CREATE TABLE stock_data (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                tr_code_id INT NOT NULL,
                                date DATE NOT NULL,
                                open FLOAT,
                                high FLOAT,
                                low FLOAT,
                                close FLOAT,
                                volume BIGINT,
                                avg_daily_volume FLOAT,
                                FOREIGN KEY (tr_code_id) REFERENCES tr_codes(id) ON DELETE CASCADE,
                                UNIQUE KEY unique_stock_date (tr_code_id, date)

                            )
                        """)

                    # peak_dates 테이블 생성
                    cursor.execute(""" 
                        SELECT COUNT(*)
                        FROM information_schema.tables
                        WHERE table_name = 'peak_dates'
                    """)
                    if cursor.fetchone()[0] == 0:
                        cursor.execute(""" 
                            CREATE TABLE peak_dates (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                tr_code_id INT NOT NULL,
                                price FLOAT NOT NULL,
                                date DATE NOT NULL,
                                FOREIGN KEY (tr_code_id) REFERENCES tr_codes(id) ON DELETE CASCADE,
                                UNIQUE KEY unique_peak_date (tr_code_id, date)
                           )
                        """)


                    cursor.execute(""" 
                        SELECT COUNT(*)
                        FROM information_schema.tables
                        WHERE table_name = 'peak_prices'
                    """)
                    if cursor.fetchone()[0] == 0:
                        cursor.execute(""" 
                            CREATE TABLE peak_prices (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                tr_code_id INT NOT NULL,
                                price FLOAT NOT NULL,
                                FOREIGN KEY (tr_code_id) REFERENCES tr_codes(id) ON DELETE CASCADE,
                                UNIQUE KEY unique_peak_price (tr_code_id, price)
                            )
                        """)


                    # filtered_peaks 테이블 생성
                    cursor.execute(""" 
                        SELECT COUNT(*)
                        FROM information_schema.tables
                        WHERE table_name = 'filtered_peaks'
                    """)
                    if cursor.fetchone()[0] == 0:
                        cursor.execute(""" 
                            CREATE TABLE filtered_peaks (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                tr_code_id INT NOT NULL,
                                date DATE NOT NULL,
                                price FLOAT NOT NULL,
                                FOREIGN KEY (tr_code_id) REFERENCES tr_codes(id) ON DELETE CASCADE,
                                UNIQUE KEY unique_filtered_peak (tr_code_id, date)
                              
                            )
                        """)

                    # tr_codes 테이블에서 해당 코드의 id 가져오기
                    cursor.execute("SELECT id FROM tr_codes WHERE code = %s", (code,))
                    tr_code_row = cursor.fetchone()
                    if not tr_code_row:
                        return JsonResponse({
                            'status': 'error',
                            'message': f'Code {code} not found in tr_codes table'
                        })
                    tr_code_id = tr_code_row[0]
                    
                    # peak_dates_count와 filtered_peaks_count 초기화
                    peak_dates_count = 0
                    filtered_peaks_count = 0
                


                    if peak_dates:
                        cursor.execute("DELETE FROM peak_dates WHERE tr_code_id = %s", (tr_code_id,))
                        peak_dates_count = len(peak_dates)
                        for peak_date in peak_dates:
                            # 중복 확인 쿼리 추가
                            cursor.execute("""
                                SELECT COUNT(*) FROM peak_dates 
                                WHERE tr_code_id = %s AND date = %s
                            """, (tr_code_id, peak_date['Date']))
                            exists = cursor.fetchone()[0] > 0  # 중복 여부 확인

                            if not exists:  # 중복이 없을 경우에만 삽입
                                try:
                                    cursor.execute(""" 
                                        INSERT INTO peak_dates (tr_code_id, date,price)
                                        VALUES (%s, %s,%s)
                                    """, (tr_code_id, peak_date['Date'],peak_date['High']))
                                except Exception as e:
                                    print(f"Error inserting peak date: {str(e)}")  # 에러 로그 출력

                    if filtered_peaks:
                        cursor.execute("DELETE FROM filtered_peaks WHERE tr_code_id = %s", (tr_code_id,))
                        filtered_peaks_count = len(filtered_peaks)
                        for filtered_peak in filtered_peaks:
                            # 중복 확인 쿼리 추가
                            cursor.execute("""
                                SELECT COUNT(*) FROM filtered_peaks 
                                WHERE tr_code_id = %s AND date = %s
                            """, (tr_code_id, filtered_peak['Date']))
                            exists = cursor.fetchone()[0] > 0  # 중복 여부 확인

                            if not exists:  # 중복이 없을 경우에만 삽입
                                try:
                                    cursor.execute(""" 
                                        INSERT INTO filtered_peaks (tr_code_id, date,price)
                                        VALUES (%s, %s, %s)
                                    """, (tr_code_id, filtered_peak['Date'],filtered_peak['High']))
                                except Exception as e:
                                    print(f"Error inserting filtered peak: {str(e)}")  # 에러 로그 출력

                    if peak_prices:
                        cursor.execute("DELETE FROM peak_prices WHERE tr_code_id = %s", (tr_code_id,))
                        for peak_price in peak_prices:
                            # 중복 확인 쿼리 추가
                            cursor.execute("""
                                SELECT COUNT(*) FROM peak_prices 
                                WHERE tr_code_id = %s AND price = %s
                            """, (tr_code_id, peak_price['Price']))
                            exists = cursor.fetchone()[0] > 0  # 중복 여부 확인

                            if not exists:  # 중복이 없을 경우에만 삽입
                                try:
                                    cursor.execute(""" 
                                        INSERT INTO peak_prices (tr_code_id, price)
                                        VALUES (%s, %s)
                                    """, (tr_code_id, peak_price['Price']))
                                except Exception as e:
                                    print(f"Error inserting peak price: {str(e)}")  # 에러 로그 출력

                    # Update tr_codes with counts
                    cursor.execute("""
                        UPDATE tr_codes
                        SET previous_peak_count = current_peak_count,
                            previous_inflection_count = current_inflection_count,
                            current_peak_count = %s,
                            current_inflection_count = %s
                        WHERE id = %s
                    """, (peak_dates_count, filtered_peaks_count, tr_code_id))

                    # current_peak_count와 current_inflection_count 값을 불러오기
                    cursor.execute("SELECT current_peak_count, current_inflection_count, previous_peak_count, previous_inflection_count FROM tr_codes WHERE id = %s", (tr_code_id,))
                    current_counts = cursor.fetchone()
                    current_peak_count = current_counts[0] if current_counts else 0
                    current_inflection_count = current_counts[1] if current_counts else 0
                    previous_peak_count = current_counts[2] if current_counts else 0
                    previous_inflection_count = current_counts[3] if current_counts else 0
                    # certified 값을 업데이트
                    if(previous_peak_count != 0 and previous_inflection_count != 0):
                        if(current_peak_count - previous_peak_count) != 0 or (current_inflection_count - previous_inflection_count) != 0:
                            cursor.execute("""
                                UPDATE tr_codes
                                SET certified = false
                                WHERE id = %s
                            """, (tr_code_id,))

                    for row in stock_data:
                        # 중복 확인 쿼리
                        cursor.execute("""
                            SELECT COUNT(*) FROM stock_data 
                            WHERE tr_code_id = %s AND date = %s
                        """, (tr_code_id, row['Date']))
                        
                        exists = cursor.fetchone()[0] > 0  # 중복 여부 확인

                        if not exists:  # 중복이 없을 경우에만 삽입
                            cursor.execute(""" 
                                INSERT INTO stock_data 
                                (tr_code_id, date, open, high, low, close, volume, avg_daily_volume)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """, (tr_code_id, row['Date'], row['Open'], row['High'],
                                  row['Low'], row['Close'], row['Volume'], avg_daily_volume))
                    
                    connection.commit()
                    
                return JsonResponse({
                    'status': 'success',
                    'message': f'Records processed - Peak Dates Count: {peak_dates_count}, Filtered Peaks Count: {filtered_peaks_count}'
                })
                
            finally:
                connection.close()
                
    except Exception as e:
        print("에러 발생:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })

# @csrf_exempt
# def Get_Stock_Data(request):
#     try:
#         if request.method == 'POST':
#             data = json.loads(request.body)
#             code = data.get('code')
            
#             connection = get_db_connection()
#             try:
#                 with connection.cursor() as cursor:
#                     # tr_codes 테이블에서 해당 코드의 id 가져오기
#                     cursor.execute("SELECT id FROM tr_codes WHERE code = %s", (code,))
#                     tr_code_row = cursor.fetchone()
#                     if not tr_code_row:
#                         return JsonResponse({
#                             'status': 'error',
#                             'message': f'Code {code} not found in tr_codes table'
#                         })
#                     tr_code_id = tr_code_row[0]
                    
#                     # stock_data 테이블에서 해당 종목의 데이터 조회
#                     cursor.execute("""
#                         SELECT date, open, high, low, close, volume, avg_daily_volume 
#                         FROM stock_data 
#                         WHERE tr_code_id = %s
#                         ORDER BY date
#                     """, (tr_code_id,))
                    
#                     columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Avg_Daily_Volume']
#                     stock_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                    
#                     return JsonResponse({
#                         'status': 'success',
#                         'code': code,
#                         'data': stock_data
#                     })
                    
#             finally:
#                 connection.close()
                
#     except Exception as e:
#         print("에러 발생:", str(e))
#         return JsonResponse({
#             'status': 'error',
#             'message': str(e)
#         })

# @csrf_exempt
# def Get_All_Codes(request):
#     try:
#         connection = get_db_connection()
#         try:
#             with connection.cursor() as cursor:
#                 cursor.execute("SELECT code FROM tr_codes WHERE certified = true")
#                 codes = [row[0] for row in cursor.fetchall()]
                
#                 return JsonResponse({
#                     'status': 'success',
#                     'codes': codes
#                 })
                
#         finally:
#             connection.close()
                
#     except Exception as e:
#         print("에러 발생:", str(e))
#         return JsonResponse({
#             'status': 'error',
#             'message': str(e)
#         })
