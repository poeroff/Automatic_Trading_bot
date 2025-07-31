import aiomysql
from dotenv import load_dotenv
import os

load_dotenv()
# DB 풀 생성 함수
async def create_db_pool():
    pool = await aiomysql.create_pool(
            host=os.getenv("DB_HOST", "localhost"),           # 기본값: localhost
            port=int(os.getenv("DB_PORT", 3306)),             # 기본값: 3306
            user=os.getenv("DB_USER", "root"),                # 기본값: root
            password=os.getenv("DB_PASSWORD", "password"),    # 기본값: password
            db=os.getenv("DB_NAME", "trading"),               # 기본값: trading
            charset=os.getenv("DB_CHARSET", "utf8"),          # 기본값: utf8
            minsize=int(os.getenv("DB_MIN_SIZE", 1)),         # 기본값: 1
            maxsize=int(os.getenv("DB_MAX_SIZE", 10)),        # 기본값: 10
            cursorclass=aiomysql.cursors.DictCursor
        )
    return pool

# DB 풀 종료 함수
async def close_db_pool(pool):
    pool.close()
    await pool.wait_closed()

# 쿼리 실행 함수
# (pool을 외부에서 주입받아서 사용하는 방식)
async def execute_query(sql, params=None, pool=None):
    # 여기에서는 pool이 넘어오지 않으면 새로 만들지 않고 에러를 낼 수도 있고
    # 필요하다면 가져와서 쓰고 끝나면 close 하는 등 구조를 다양하게 잡을 수 있습니다.
    if pool is None:
        raise ValueError("DB pool is not provided.")

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(sql, params)
            result = await cur.fetchall()
            await conn.commit()
            return result
