from fastapi import APIRouter, Request
from app.database import execute_query
from pyampd.ampd import find_peaks  # 정확한 경로에서 함수 가져오기
import pandas as pd

router = APIRouter(prefix="/schedule", tags=["schedule"])


# 1) 실제 DB 작업 로직 함수
#    - request 없이, 풀만 주어지면 작동하게끔 설계
async def day_find_freak_update_logic(pool):

    sql = "SELECT * FROM trading.KoreanStockCode"
    result = await execute_query(sql, pool=pool)
    for row in result:
        stock_id = row['id']
        sql = f"SELECT * FROM trading.DayStockData where stock_id={stock_id}"
        stock_result = await execute_query(sql, pool=pool)
        if not stock_result:
            continue
        df = pd.DataFrame(stock_result)
        df['date'] = pd.to_datetime(df['date'], format='%Y%m%d')

        # 종가 추출
        closing_prices = df['close'].values

        # AMPD 알고리즘으로 피크 감지
        peaks = find_peaks(closing_prices)

        peak_dates = df['date'].iloc[peaks]
        peak_values = closing_prices[peaks]
        for date_val, close_val in zip(peak_dates, peak_values):
            sql_insert = """
                INSERT INTO trading.peak_dates (price, date, stock_id)
                VALUES (%s, %s, %s)
            """
            params = [close_val, date_val, stock_id]
            await execute_query(sql_insert, params=params, pool=pool)
        print(peak_dates,peak_values)



# 2) FastAPI 라우터 핸들러
@router.get("/DayFindFeakUpdate")
async def day_find_freak_update_endpoint(request: Request):
    db_pool = request.app.state.db_pool  # app.state 에서 풀 가져오기
    data = await day_find_freak_update_logic(db_pool)
    return {"data": data}
