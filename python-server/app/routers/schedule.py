from fastapi import APIRouter, Request
from app.database import execute_query
from pyampd.ampd import find_peaks  # 정확한 경로에서 함수 가져오기
import pandas as pd

router = APIRouter(prefix="/schedule", tags=["schedule"])


# 1) 실제 DB 작업 로직 함수
#    - request 없이, 풀만 주어지면 작동하게끔 설계
async def day_find_freak_update_logic(pool):
    try:
        sql = "SELECT * FROM trading.KoreanStockCode"
        result = await execute_query(sql, pool=pool)
        
        for row in result:
            stock_id = row['id']
            try:
                sql = f"SELECT * FROM trading.DayStockData where stock_id={stock_id}"
                stock_result = await execute_query(sql, pool=pool)
                
                if not stock_result:
                    continue
                
                df = pd.DataFrame(stock_result)
                df['date'] = pd.to_datetime(df['date'], format='%Y%m%d')
                
                # 종가 추출
                closing_prices = df['close'].values
                
                # AMPD 알고리즘으로 피크 감지
                try:
                    peaks = find_peaks(closing_prices)
                except ValueError as e:
                    print(f"AMPD Error: {e} for stock_id={stock_id}")
                    continue
                
                if len(peaks) == 0:
                    print(f"No peaks found for stock_id={stock_id}")
                    continue
                
                peak_dates = df['date'].iloc[peaks]
                peak_values = closing_prices[peaks]
                
                for date_val, close_val in zip(peak_dates, peak_values):
                    try:
                        sql_check = """
                            SELECT 1 FROM trading.peak_dates
                            WHERE stock_id = %s AND date = %s
                        """
                        params = [stock_id, date_val]
                        result = await execute_query(sql_check, params=params, pool=pool)
                        
                        if not result:
                            sql_insert = """
                                INSERT INTO trading.peak_dates (price, date, stock_id)
                                VALUES (%s, %s, %s)
                            """
                            params = [close_val, date_val, stock_id]
                            await execute_query(sql_insert, params=params, pool=pool)
                    except Exception as e:
                        print(f"Error inserting peak data: {e} for stock_id={stock_id}, date={date_val}")
                
                print(peak_dates, peak_values)
            except Exception as e:
                print(f"Error processing stock data: {e} for stock_id={stock_id}")
    
    except Exception as e:
        print(f"Main logic error: {e}")




# 2) FastAPI 라우터 핸들러
@router.get("/DayFindFeakUpdate")
async def day_find_freak_update_endpoint(request: Request):
    db_pool = request.app.state.db_pool  # app.state 에서 풀 가져오기
    data = await day_find_freak_update_logic(db_pool)
    return {"data": data}
