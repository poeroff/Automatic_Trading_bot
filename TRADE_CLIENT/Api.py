import numpy as np
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
        min_gap = 50
        
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

    def find_peaks_combined(self,df):
        # 1. 주요 고점 찾기
        peaks1 = self.find_peaks(df, 'High', compare_window=23, threshold=0.2)
        peak_indices1 = [idx for idx, _ in peaks1]

        # 2. 변곡점을 한 번만 계산하고 저장
        n = 6
        initial_peaks = argrelextrema(df["High"].values, np.greater_equal, order=n)[0]
        initial_peaks_df = df.iloc[initial_peaks][["Date", "High"]]
        initial_rising_peaks = initial_peaks_df[initial_peaks_df["High"].diff() > 0]
        
        # 3. 저장된 변곡점에서 고점 주변 15일 이내의 점들만 제거
        filtered_peaks = initial_rising_peaks[~initial_rising_peaks.index.map(
            lambda x: any(abs(x - peak_idx) <= 13 for peak_idx in peak_indices1)
        )]


        # 1. 주요 고점 찾기
        peaks1 = self.find_peaks(df, 'High', compare_window=23, threshold=0.2)
        
        peak_dates1 = df.iloc[peak_indices1]["Date"]
        peak_prices = [price for _, price in peaks1]
        return peak_dates1,peak_prices,filtered_peaks

    async def Stock_Data(self):
        stock_data_dict = self.kiwoom.All_Stock_Data()  # 종목명과 종목코드 딕셔너리
        tr_codes = list(stock_data_dict.keys())[:1]  # 예시로 첫 3개 종목 코드만 사용
        total_batches = (len(tr_codes) + 99) // 100  # 총 배치 수 계산
        
        try:
            async with aiohttp.ClientSession() as session:
                # 종목 코드와 종목명을 함께 전송
                await session.post(
                    f"{self.base_url}/tr_code_collection/",
                    json={'tr_codes': [{'code': code, 'name': stock_data_dict[code]} for code in tr_codes]}
                )
                
                # 100개 단위로 tr_code 처리
                for batch_index, tr_code_batch in enumerate(self.chunks(tr_codes, 100), start=1):
                    print(f"처리 중인 배치: {batch_index}/{total_batches}")
                    
                    # 각 배치에 대해 데이터 가져오기
                    all_stock_data = self.kiwoom.get_stock_data_all(tr_code_batch)
                  
                    print("수집된 데이터:", list(all_stock_data.keys()))  # 어떤 종목이 수집되었는지 확인
                    
                    # 각 종목별로 서버에 전송
                    for code in tr_code_batch:
                        stock_data = all_stock_data.get(code)
                        if stock_data is not None:
                            stock_name = stock_data_dict[code]  # 종목명 가져오기
                            peak_dates1, peak_prices, filtered_peaks = self.find_peaks_combined(stock_data)
                            await self.process_stock_data(code, stock_data, session, peak_dates1, peak_prices, filtered_peaks, stock_name)
                        else:
                            print(f"종목 코드 {code}에 대한 데이터가 없습니다.")
        except Exception as e:
            print("전송 에러:", str(e))
        
    async def process_stock_data(self, code, stock_data, session, peak_dates,peak_prices,filtered_peaks, stock_name):
        try:
            # DataFrame을 리스트로 변환
            data_list = stock_data.to_dict('records')
            
            # peak_dates1과 filtered_peaks를 직렬화 가능한 형태로 변환
            peak_dates_list = peak_dates.reset_index().to_dict('records')
            peak_prices_list = [{'Price': price} for price in peak_prices]  # 리스트를 딕셔너리 형태로 변환
            filtered_peaks_list = filtered_peaks.reset_index().to_dict('records')
            
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


