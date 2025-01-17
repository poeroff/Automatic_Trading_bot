import pymysql

connection = pymysql.connect(
        host='localhost',
        user='root',
        password='wqdsdsf123!',
        database='test',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
print("Successfully connected to the database.")

    
try:
    with connection.cursor() as cursor:
        # 테이블 생성 쿼리
        sql = """
        CREATE TABLE IF NOT EXISTS your_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            age INT
        )
        """
        cursor.execute(sql)
    connection.commit()
    print("테이블이 성공적으로 생성되었습니다.")
except pymysql.Error as e:
    print(f"오류 발생: {e}")
finally:
    connection.close()