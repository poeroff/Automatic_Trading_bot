import numpy as np
import pandas as pd
import requests
import asyncio
import aiohttp
from kiwoom_api import KiwoomAPI
import time
from datetime import datetime
from itertools import islice
from scipy.signal import argrelextrema


class Api:
    def __init__(self,kiwoom):
        self.kiwoom = KiwoomAPI(kiwoom)
        self.base_url = "http://127.0.0.1:8000"
    
    def chunks(self, data, size=100):
        """데이터를 size 크기만큼 나누어 반환하는 제너레이터"""
        it = iter(data)
        for first in it:
            yield [first] + list(islice(it, size - 1))

    def find_peaks(self,dataframe, high_column='High', compare_window=23, threshold=0.2):
        min_gap = 101
        
        peaks = []
        prices = dataframe[high_column].values
        last_peak_idx = -min_gap
        last_peak_price = 0
        
        for i in range(compare_window, len(dataframe)):
            window_before = prices[max(0, i-compare_window):i]
            window_after = prices[i+1:min(len(prices), i+compare_window+1)]
            current_price = prices[i]
    
            if (
                current_price > np.max(window_before) and 
                (len(window_after) == 0 or current_price > np.max(window_after))):
                
                future_min = np.min(prices[i:]) if i < len(prices)-1 else current_price
                drop_ratio = (current_price - future_min) / current_price
                
                if drop_ratio >= threshold:
                    if peaks and (i - last_peak_idx < min_gap):
                        if current_price > last_peak_price:
                            peaks.pop()
                            peaks.append((i, current_price))
                            last_peak_idx = i
                            last_peak_price = current_price
                    else:
                        peaks.append((i, current_price))
                        last_peak_idx = i
                        last_peak_price = current_price
        
        return peaks

    def find_peaks_combined(self, df):
        try:
            # DataFrame 복사 및 인덱스 리셋
            df = df.copy()
            if df.index.name == 'Date':
                df = df.reset_index()
            
            # 날짜 형식 확인 및 변환
            if isinstance(df['Date'].iloc[0], str):
                df['Date'] = pd.to_datetime(df['Date'], format='%Y%m%d')
            
            # 1. 주요 고점 찾기
            peaks1 = self.find_peaks(df, 'High', compare_window=23, threshold=0.2)
            peak_indices1 = [idx for idx, _ in peaks1]
            
            # 2. 변곡점 계산
            n = 6
            initial_peaks = argrelextrema(df["High"].values, np.greater_equal, order=n)[0]
            
            # initial_peaks_df 생성 시 index 처리 수정
            initial_peaks_df = df.iloc[initial_peaks].copy()
            
            # High 값의 차이 계산을 위한 임시 DataFrame
            temp_df = initial_peaks_df[['Date', 'High']].copy()
            temp_df['High_diff'] = temp_df['High'].diff()
            
            # 상승하는 고점만 선택
            initial_rising_peaks = temp_df[temp_df['High_diff'] > 0].copy()
            
            if initial_rising_peaks.empty:
                return [], [], pd.DataFrame(columns=['Date', 'High'])
            
            # 3. 고점 주변 15일 이내의 점들 제거
            mask = ~initial_rising_peaks.index.map(
                lambda x: any(abs(x - peak_idx) <= 13 for peak_idx in peak_indices1)
            )
            filtered_peaks = initial_rising_peaks[mask].copy()
            
            if filtered_peaks.empty:
                return [], [], pd.DataFrame(columns=['Date', 'High'])
            
            # 4. 날짜순 정렬 및 5개월 필터링
            filtered_peaks = filtered_peaks.sort_values('Date')
            filtered_peaks = filtered_peaks.reset_index(drop=True)
            
            to_keep = []
            last_kept_date = None
            
            for idx, row in filtered_peaks.iterrows():
                if last_kept_date is None or (row["Date"] - last_kept_date).days > 122:
                    to_keep.append(idx)
                    last_kept_date = row["Date"]
            
            if not to_keep:
                print("유효한 변곡점이 없습니다.")
                return [], [], pd.DataFrame(columns=['Date', 'High'])
            
            # 5. 최종 필터링
            filtered_peaks = filtered_peaks.iloc[to_keep].copy()
            
            # 결과 생성
            peak_dates1 = df.iloc[peak_indices1]["Date"]
            peak_prices = [price for _, price in peaks1]
            
            # 날짜 형식을 문자열로 변환
            filtered_peaks['Date'] = filtered_peaks['Date'].dt.strftime('%Y-%m-%d')
            peak_dates1 = peak_dates1.dt.strftime('%Y-%m-%d')
            
            return peak_dates1, peak_prices, filtered_peaks
            
        except Exception as e:
            print(f"find_peaks_combined 처리 중 에러 발생: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return [], [], pd.DataFrame(columns=['Date', 'High'])
    
    async def Stock_Data(self):
        async with aiohttp.ClientSession() as session:
            stock_data = await session.get("http://localhost:4000/stock-data/get_all_codes")
            stock_data = await stock_data.json()

            # 모든 주식 코드 추출
            all_codes = [item['code'] for item in stock_data]  # 리스트 형태일 경우
            # all_codes = [item['code'] for item in stock_data['data']]  # 딕셔너리 형태일 경우
            total_batches = (len(all_codes) + 9) // 10

            # 100개 단위로 tr_code 처리
            for batch_index, tr_code_batch in enumerate(self.chunks(all_codes, 10), start=1):
                print(f"처리 중인 배치: {batch_index}/{total_batches}")
                try:
                    # 각 배치에 대해 데이터 가져오기
                    all_stock_data = self.kiwoom.get_stock_data_all(tr_code_batch)
                    # 각 종목별로 서버에 전송
                    for code in tr_code_batch:
                        try:
                            stock_data = all_stock_data.get(code)
                            if stock_data is not None:
                                try:
                                    # find_peaks_combined에서 에러가 발생하면 건너뛰기
                                    peak_dates1, peak_prices, filtered_peaks = self.find_peaks_combined(stock_data)
                                    await self.process_stock_data(code, stock_data, session, peak_dates1, peak_prices, filtered_peaks)
                                except Exception as e:
                                    print(f"종목 {code} find_peaks_combined 처리 중 에러 발생. 건너뛰기: {str(e)}")
                                    continue
                            else:
                                print(f"종목 코드 {code}에 대한 데이터가 없습니다.")
                        except Exception as e:
                            print(f"종목 {code} 처리 중 에러 발생. 건너뛰기: {str(e)}")
                            continue
                except Exception as e:
                    print(f"배치 {batch_index} 처리 중 에러 발생. 다음 배치로 진행: {str(e)}")
                    continue

        
    async def process_stock_data(self, code, stock_data, session, peak_dates, peak_prices, filtered_peaks):
        try:
            # DataFrame을 리스트로 변환
            data_list = stock_data.to_dict('records')
            
            # peak_dates가 DataFrame이 아닐 경우 처리
            if isinstance(peak_dates, pd.Series):
                peak_dates_list = peak_dates.reset_index().to_dict('records')
            else:
                peak_dates_list = []  # 빈 리스트로 초기화
            
            peak_prices_list = [{'Price': price} for price in peak_prices]  # 리스트를 딕셔너리 형태로 변환
            filtered_peaks_list = filtered_peaks.reset_index().to_dict('records') if not filtered_peaks.empty else []  # 빈 리스트로 초기화
            
       
            async with session.post(
                f"{self.base_url}/stock_data_collection/",
                json={
                    'code': code,
                    'data': data_list,
                    'peak_dates': peak_dates_list,
                    'peak_prices': peak_prices_list,
                    'filtered_peaks': filtered_peaks_list
                }
            ) as response:
                result = await response.json()
                print(f"종목 {code} 데이터 전송 결과:", result)
                
        except Exception as e:
            print(f"종목 {code} 처리 중 에러: {str(e)}")


