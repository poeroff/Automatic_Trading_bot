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
                            current_inflection_count INT DEFAULT 0,  
                            previous_inflection_count INT DEFAULT 0, 
                            previous_peak_count INT DEFAULT 0, 
                            current_peak_count INT DEFAULT 0  
                        )
                    """)
                
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
                            volume INT,
                            FOREIGN KEY (tr_code_id) REFERENCES tr_codes(id),
                            UNIQUE KEY unique_stock_date (tr_code_id, date)
                        )
                    """)
                
                # 테이블이 있는 경우 데이터 동기화
                cursor.execute("SELECT code FROM tr_codes")
                existing_codes = set(row[0] for row in cursor.fetchall())
                new_codes = {item['code']: item['name'] for item in tr_codes}  # 종목명과 함께 저장
                
                # 삭제해야 할 코드 (DB에는 있지만 tr_codes에는 없는 것)
                codes_to_delete = existing_codes - new_codes.keys()
                if codes_to_delete:
                    # 자식 테이블 데이터 삭제
                    cursor.execute(
                        "DELETE FROM stock_data WHERE tr_code_id IN (SELECT id FROM tr_codes WHERE code IN (%s))" % 
                        ','.join(['%s'] * len(codes_to_delete)),
                        tuple(codes_to_delete)
                    )
                    # 부모 테이블 데이터 삭제
                    cursor.execute(
                        "DELETE FROM tr_codes WHERE code IN (%s)" % 
                        ','.join(['%s'] * len(codes_to_delete)),
                        tuple(codes_to_delete)
                    )
                    
                # 추가해야 할 코드 (tr_codes에는 있지만 DB에는 없는 것)
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
            connection = get_db_connection()
            try:
                with connection.cursor() as cursor:
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
                                date DATE NOT NULL,
                                FOREIGN KEY (tr_code_id) REFERENCES tr_codes(id),
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
                                FOREIGN KEY (tr_code_id) REFERENCES tr_codes(id),
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
                                FOREIGN KEY (tr_code_id) REFERENCES tr_codes(id),
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
                    
                    # Insert peak_dates
                    peak_dates_count = len(peak_dates)
                    for peak_date in peak_dates:
                        try:
                            cursor.execute(""" 
                                INSERT INTO peak_dates (tr_code_id, date)
                                VALUES (%s, %s)
                            """, (tr_code_id, peak_date['Date']))
                        except Exception as e:
                            if "Duplicate entry" in str(e):
                                continue  # 중복된 경우 건너뛰기

                    # Insert filtered_peaks
                    filtered_peaks_count = len(filtered_peaks)
                    for filtered_peak in filtered_peaks:
                        try:
                            cursor.execute(""" 
                                INSERT INTO filtered_peaks (tr_code_id, date)
                                VALUES (%s, %s)
                            """, (tr_code_id, filtered_peak['Date']))
                        except Exception as e:
                            if "Duplicate entry" in str(e):
                                continue  # 중복된 경우 건너뛰기

                    # Insert peak_prices
                    for peak_price in peak_prices:
                        try:
                            cursor.execute(""" 
                                INSERT INTO peak_prices (tr_code_id, price)
                                VALUES (%s, %s)
                            """, (tr_code_id, peak_price['Price']))
                        except Exception as e:
                            if "Duplicate entry" in str(e):
                                continue  # 중복된 경우 건너뛰기

                    # Update tr_codes with counts
                    cursor.execute("""
                        UPDATE tr_codes
                        SET previous_peak_count = current_peak_count,
                            previous_inflection_count = current_inflection_count,
                            current_peak_count = %s,
                            current_inflection_count = %s
                        WHERE id = %s
                    """, (peak_dates_count, filtered_peaks_count, tr_code_id))

                    for row in stock_data:
                        cursor.execute(""" 
                            SELECT 1 FROM stock_data 
                            WHERE tr_code_id = %s AND date = %s
                        """, (tr_code_id, row['Date']))
                        
                        if cursor.fetchone():
                            cursor.execute(""" 
                                UPDATE stock_data 
                                SET open = %s, high = %s, low = %s, close = %s, volume = %s
                                WHERE tr_code_id = %s AND date = %s
                            """, (row['Open'], row['High'], row['Low'], row['Close'], row['Volume'], tr_code_id, row['Date']))
                        else:
                            cursor.execute(""" 
                                INSERT INTO stock_data 
                                (tr_code_id, date, open, high, low, close, volume)
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """, (tr_code_id, row['Date'], row['Open'], row['High'],
                                 row['Low'], row['Close'], row['Volume']))
                    
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

@csrf_exempt
def Get_Stock_Data(request):
    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            code = data.get('code')
            
            connection = get_db_connection()
            try:
                with connection.cursor() as cursor:
                    # tr_codes 테이블에서 해당 코드의 id 가져오기
                    cursor.execute("SELECT id FROM tr_codes WHERE code = %s", (code,))
                    tr_code_row = cursor.fetchone()
                    if not tr_code_row:
                        return JsonResponse({
                            'status': 'error',
                            'message': f'Code {code} not found in tr_codes table'
                        })
                    tr_code_id = tr_code_row[0]
                    
                    # stock_data 테이블에서 해당 종목의 데이터 조회
                    cursor.execute("""
                        SELECT date, open, high, low, close, volume 
                        FROM stock_data 
                        WHERE tr_code_id = %s
                        ORDER BY date
                    """, (tr_code_id,))
                    
                    columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
                    stock_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                    print(code,stock_data)
                    
                    return JsonResponse({
                        'status': 'success',
                        'code': code,
                        'data': stock_data
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
def Get_All_Codes(request):
    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT code FROM tr_codes")
                codes = [row[0] for row in cursor.fetchall()]
                
                return JsonResponse({
                    'status': 'success',
                    'codes': codes
                })
                
        finally:
            connection.close()
                
    except Exception as e:
        print("에러 발생:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })
