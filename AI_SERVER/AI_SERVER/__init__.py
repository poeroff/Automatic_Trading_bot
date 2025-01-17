import pymysql
pymysql.install_as_MySQLdb()

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='wqdsdsf123!',
        database='test',
        charset='utf8mb4'
    )