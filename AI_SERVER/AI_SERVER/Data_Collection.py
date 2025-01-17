from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from AI_SERVER import get_db_connection

@csrf_exempt
def tr_code_Collection(request):
    try:
        data = json.loads(request.body)
        tr_codes = data.get('tr_codes')
        
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
                
                # stock_data 테이블 존재 여부 확인
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM information_schema.tables 
                    WHERE table_schema = 'test' 
                    AND table_name = 'stock_data'
                """)
                stock_data_exists = cursor.fetchone()[0] == 1
                
                if not tr_codes_exists:
                    # tr_codes 테이블 생성
                    cursor.execute("""
                        CREATE TABLE tr_codes (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            code VARCHAR(10) NOT NULL
                        )
                    """)
                
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
                new_codes = set(tr_codes)
                    
                # 삭제해야 할 코드 (DB에는 있지만 tr_codes에는 없는 것)
                codes_to_delete = existing_codes - new_codes
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
                codes_to_add = new_codes - existing_codes
                for code in codes_to_add:
                    cursor.execute(
                        "INSERT INTO tr_codes (code) VALUES (%s)",
                        (code,)
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
                    
                    inserted = 0
                    skipped = 0

                    for row in stock_data:
                        # 해당 날짜의 데이터가 있는지 확인
                        cursor.execute("""
                            SELECT 1 FROM stock_data 
                            WHERE tr_code_id = %s AND date = %s
                        """, (tr_code_id, row['Date']))
                        
                        if cursor.fetchone():
                            # 데이터가 있으면 스킵
                            skipped += 1
                        else:
                            # 데이터가 없으면 새로 삽입
                            cursor.execute("""
                                INSERT INTO stock_data 
                                (tr_code_id, date, open, high, low, close, volume)
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """, (tr_code_id, row['Date'], row['Open'], row['High'],
                                 row['Low'], row['Close'], row['Volume']))
                            inserted += 1
                    
                    connection.commit()
                    
                return JsonResponse({
                    'status': 'success',
                    'message': f'Records processed - Inserted: {inserted}, Skipped: {skipped}'
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
