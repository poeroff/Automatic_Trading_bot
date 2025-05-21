import logging
from fastapi import APIRouter, Request, logger
from app.database import execute_query
from pyampd.ampd import find_peaks  # 정확한 경로에서 함수 가져오기
import pandas as pd
import asyncio
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/schedule", tags=["schedule"])



# RSI 계산 함수
def compute_rsi(series, period=14):
    # 종가 차이
    delta = series.diff()

    # 상승분 / 하락분 추출
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    # 이동평균(EMA가 아니라 단순 rolling 평균으로 처리)
    avg_gain = gain.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period, adjust=False).mean()

    # 0으로 나누는 경우 방지
    rs = avg_gain / avg_loss

    # RSI 계산
    rsi = 100 - (100 / (1 + rs))
    return rsi



# 1) 실제 DB 작업 로직 함수
#    - request 없이, 풀만 주어지면 작동하게끔 설계
async def day_find_freak_update_logic(pool):

    try:
        sql = "SELECT * FROM trading.KoreanStockCode"
        result = await execute_query(sql, pool=pool)
        await execute_query("SET SQL_SAFE_UPDATES = 0", pool=pool)
        sql_clear_peak_dates = "DELETE FROM trading.peak_dates"
        sql_clear_filtered_peaks = "DELETE FROM trading.filtered_peaks"
        
        await execute_query(sql_clear_peak_dates, pool=pool)
        await execute_query(sql_clear_filtered_peaks, pool=pool)
        await execute_query("SET SQL_SAFE_UPDATES = 1", pool=pool)
        
        for row in result:
            stock_id = row['id']
            try:
                sql = f"SELECT * FROM trading.DayStockData where stock_id={stock_id}"
                stock_result = await execute_query(sql, pool=pool)
                
                if not stock_result:
                    continue
                
                df = pd.DataFrame(stock_result)
                df = df.sort_values(by='date').reset_index(drop=True)
                # RSI 컬럼 추가 (기간 14 예시)
                if len(df) < 14:
                    continue
                df['RSI'] = compute_rsi(df['close'], period=14)
                df['date'] = pd.to_datetime(df['date'], format='%Y%m%d')
                df['EMA_224'] = df['close'].ewm(span=224, adjust=False).mean()
              
           
                # 종가 추출
                closing_prices = df['high'].values
                
                # AMPD 알고리즘으로 피크 감지
                try:
                    peaks = find_peaks(closing_prices)
                except ValueError as e:
                    continue
                
                if len(peaks) == 0:
                    continue

                find_peak = [p for p in peaks if df.iloc[p]['RSI'] >= 70  and df.iloc[p]['close'] > df.iloc[p]['EMA_224']]
                find_peak_dates = df.iloc[find_peak]['date']
                find_peak_values = df.iloc[find_peak]['high']
                filtered_peaks =  [p for p in peaks if df.iloc[p]['RSI'] < 70 and df.iloc[p]['RSI'] >= 50  and df.iloc[p]['close'] > df.iloc[p]['EMA_224']]
                filtered_peaks_dates = df.iloc[filtered_peaks]['date']
                filtered_peaks_values = df.iloc[filtered_peaks]['high']

                peak_count = 0
                filtered_peak_count = 0

                for date_val, close_val in zip(find_peak_dates, find_peak_values):
                    try:
                        sql_insert = """
                            INSERT INTO trading.peak_dates (price, date, stock_id)
                            VALUES (%s, %s, %s)
                        """
                        params = [close_val, date_val, stock_id]
                        await execute_query(sql_insert, params=params, pool=pool)
                        peak_count += 1
                        await asyncio.sleep(0.01)  # 10ms delay to throttle writes
                    except Exception as e:
                        print(f"Error inserting peak data: {e} for stock_id={stock_id}, date={date_val}")
                for date_val, close_val in zip(filtered_peaks_dates, filtered_peaks_values):
                    try:
                        sql_insert = """
                            INSERT INTO trading.filtered_peaks (price, date, stock_id)
                            VALUES (%s, %s, %s)
                        """
                        params = [close_val, date_val, stock_id]
                        await execute_query(sql_insert, params=params, pool=pool)
                        filtered_peak_count += 1
                        await asyncio.sleep(0.01)  # 10ms delay to throttle writes
                    except Exception as e:
                        print(f"Error inserting peak data: {e} for stock_id={stock_id}, date={date_val}")
    
                select_sql = "SELECT * FROM trading.StockFilter WHERE stock_id = %s"
                select_params = [stock_id]
                row = await execute_query(select_sql, params=select_params, pool=pool)

                if row:
                    # 2. 이미 있으면 UPDATE
                    update_sql = """
                        UPDATE trading.StockFilter
                        SET currenthigh_count = %s , previoushigh_count = %s
                        WHERE stock_id = %s
                    """
                    update_params = [peak_count, row[0]['currenthigh_count'], stock_id]
                    await execute_query(update_sql, params=update_params, pool=pool)
                else:
                    # 3. 없으면 CREATE (INSERT)
                    insert_sql = """
                        INSERT INTO trading.StockFilter (stock_id, currenthigh_count)
                        VALUES (%s, %s)
                    """
                    insert_params = [stock_id, peak_count]
                    await execute_query(insert_sql, params=insert_params, pool=pool)
       
                if row:
                    if(row[0]['currenthigh_count'] != row[0]['previoushigh_count']):
                        update_sql = """
                            UPDATE trading.KoreanStockCode
                            SET certified = false
                            WHERE id = %s
                        """
                        await execute_query(update_sql, params=[stock_id], pool=pool)
                
                if peak_count <= 3 or filtered_peak_count <= 3:
                    try:
                        update_sql = """
                            UPDATE trading.KoreanStockCode
                            SET unmet_conditions = false
                            WHERE id = %s
                        """
                        await execute_query(update_sql, params=[stock_id], pool=pool)
                    except Exception as e:
                        print(f"Error updating certified status: {e} for stock_id={stock_id}")
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
