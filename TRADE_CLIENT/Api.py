import re
import numpy as np
import pandas as pd
import requests
import asyncio
import aiohttp
from kiwoom_api import KiwoomAPI
import time
from datetime import datetime, timedelta
from itertools import islice
from scipy.signal import argrelextrema

# 모든 행과 열을 출력하도록 설정
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)

class Api:
    def __init__(self,kiwoom):
        self.kiwoom = kiwoom
        self.kiwoomapi = KiwoomAPI(kiwoom)

    #청크로 몇개씩 나누어서 서버에 보낼지 선택택
    def chunks(self, data, size=100):
        """데이터를 size 크기만큼 나누어 반환하는 제너레이터"""
        it = iter(data)
        for first in it:
            yield [first] + list(islice(it, size - 1))

    #주식 종목 상세 정보 가져오기(위험 종목 가져오기기)
    def is_stock_suspended(self, stock_code):
        try:
            state = self.kiwoom.GetMasterStockState(stock_code)
            suspension_keywords = ["거래정지", "감리종목", "관리종목"]
            
            return any(keyword in state for keyword in suspension_keywords)

        except Exception as e:
            print(f"거래정지 상태 확인 중 오류 발생: {str(e)}")
            return False
    
    # 중복 제거 함수
    def remove_duplicates(self, initial_peaks, peak_indices1):
        seen = set(peak_indices1)
        return [x for x in initial_peaks if x not in seen or seen.remove(x)]
    
#------------------------------------------------------확장 함수(부 역할)---------------------------------------------------------------------------------------
    #코스피 코스닥 필터링 주식 코드 가져오기
    def All_Stock_Data(self):
        # 코스피 종목 코드 가져오기
        kospi_codes = self.kiwoom.GetCodeListByMarket('0')  # 0: 코스피
   
        # 코스닥 종목 코드 가져오기
        kosdaq_codes = self.kiwoom.GetCodeListByMarket('10')  # 10: 코스닥

        # 숫자로만 구성된 코드만 필터링
        kospi_codes = [code for code in kospi_codes if code.isdigit()]
        kosdaq_codes = [code for code in kosdaq_codes if code.isdigit()]

        all_codes = kospi_codes + kosdaq_codes
        stock_codes = {}  # 종목코드와 종목명을 저장할 딕셔너리

        for code in all_codes:
            stock_name = self.kiwoom.GetMasterCodeName(code)
            exclude_keywords = [
                'ETF', 'ETN', '선물', 
                'KODEX', 'TIGER', 'KBSTAR',
                'SOL', 'ACE',"VITA",
                'HANARO', 'KOSEF', 'KINDEX', 
                'ARIRANG', 'SMART', 'FOCUS',
                'TIMEFOLIO', 'WOORI',
                '우B', '우C', 
                '레버리지', '인버스',
                'KoAct', '채권', "스팩","PLUS",
                "RISE","KIWOOM","BNK","WON",
                "마이다스","에셋플러스","KCGI","리츠","액티브"
            ]
            
            is_suspended = self.is_stock_suspended(code)
            #위험 종목일 경우 필터링을 통해 DB에 안들어가게
            if is_suspended == False:
                if not any(keyword in stock_name for keyword in exclude_keywords) and not re.search(r'\d', stock_name):
                    stock_codes[code] = stock_name
        print(f"필터링 후 종목 수: {len(stock_codes)}")
        return stock_codes  # 종목코드와 종목명을 포함한 딕셔너리 반환
    
    def get_stock_data_all(self, Tr_code):
        set_d = (datetime.now() - timedelta(days=1)).strftime("%Y%m%d")

        all_stock_data = {}
        total_codes = len(Tr_code)

        for idx, code in enumerate(Tr_code, 1):
            print(f"\n[{idx}/{total_codes}] 종목 코드 {code} 데이터 조회 중...")
            df_list = []
    
            # 첫 번째 블록 요청
            df_firstblock = self.kiwoom.block_request(
                    "opt10082",
                    종목코드=code,
                    기준일자=set_d,
                    수정주가구분=3,
                    output="주식주봉차트조회",
                    next=0
            )
            time.sleep(3.6)

            # 데이터가 있는지 확인
            if len(df_firstblock) == 0:
                print(f"[{idx}/{total_codes}] 종목 코드 {code} - 데이터 없음")
                continue  # 데이터가 없으면 다음 종목으로

            df_list.append(df_firstblock)
   
            # 연속 조회
            while self.kiwoom.tr_remained:
                df_nextblock = self.kiwoom.block_request(
                    "opt10082",
                    종목코드=code,
                    기준일자=set_d,
                    수정주가구분=3,
                    output="주식주봉차트조회",
                    next=2
                )

                time.sleep(3.6)

                if len(df_nextblock) == 0:
                    break

                print(f"연속 조회 데이터: {df_nextblock}")  # 연속 조회 데이터 출력
                df_list.append(df_nextblock)
                
               

            # 각 종목별 데이터프레임 처리
            final_df = pd.concat(df_list)
            final_df = final_df.reset_index(drop=True)

            try:
                df = pd.DataFrame(final_df)
                
                if df.empty:
                    print(f"종목 코드 {code}에 대한 데이터가 없습니다.")
                    continue  # 다음 종목으로 넘어가기

                df = df.sort_index(ascending=False).reset_index(drop=True)
                
                # 필요한 컬럼이 있는지 확인
                required_columns = ['일자', '시가', '고가', '저가', '현재가', '거래량']
                if not all(col in df.columns for col in required_columns):
                    print(f"종목 코드 {code}에 필요한 컬럼이 없습니다.")
                    continue  # 다음 종목으로 넘어가기

                df = df[required_columns]

                # 데이터 타입 변환
                try:
                    df = df.astype({
                        '일자': str,
                        '시가': float,
                        '고가': float,
                        '저가': float,
                        '현재가': float,
                        '거래량': float
                    })
                except ValueError as e:
                    print(f"종목 코드 {code}의 데이터 타입 변환 중 에러 발생: {str(e)}")
                    continue  # 다음 종목으로 넘어가기

                df.columns = ["Date", 'Open', 'High', 'Low', 'Close', 'Volume']

                # 딕셔너리에 저장
                all_stock_data[code] = df

            except Exception as e:
                print(f"종목 코드 {code} 처리 중 에러 발생: {str(e)}")

        return all_stock_data


#------------------------------------------------------메인인 함수(주 역할)---------------------------------------------------------------------------------------


    
    def find_peaks(self, dataframe, high_column='High', compare_window=23, threshold=0.2):
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
        find_peaks = []
        if peaks:
            find_peaks = [peaks[0]]
            for i in range(0, len(peaks) - 1):
                current_peak = peaks[i]
                next_peak = peaks[i + 1]
                if current_peak[1] < next_peak[1]:
                    find_peaks.append(peaks[i+1])
           

      
        return find_peaks or peaks  # peaks가 비어있으면 빈 리스트 반환
        



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
            peak_dates1 = df.iloc[peak_indices1][["Date", "High"]]  # ✅ 컬럼 리스트로 묶기
            peak_prices = [price for _, price in peaks1]
         
            
            # 2. 변곡점 계산
            n = 6
            initial_peaks = argrelextrema(df["High"].values, np.greater_equal, order=n)[0]
            unique_initial_peaks = self.remove_duplicates(initial_peaks, peak_indices1)
            
            # initial_peaks_df 생성 시 index 처리 수정
            initial_peaks_df = df.iloc[unique_initial_peaks].copy()
            
            # High 값의 차이 계산을 위한 임시 DataFrame
            temp_df = initial_peaks_df[['Date', 'High']].copy()
            temp_df['High_diff'] = temp_df['High'].diff()
            
            # 상승하는 고점만 선택
            initial_rising_peaks = temp_df[temp_df['High_diff'] > 0].copy()
            
            if initial_rising_peaks.empty:
                return [], [], pd.DataFrame(columns=['Date', 'High'])
            
            # 3. 고점 주변 3개월 이내의 점들 제거
            mask = ~initial_rising_peaks.index.map(
                lambda x: any(abs(x - peak_idx) <= 13 for peak_idx in peak_indices1)
            )
            filtered_peaks = initial_rising_peaks[mask].copy()
            
            if filtered_peaks.empty:
                return [], [], pd.DataFrame(columns=['Date', 'High'])
            
            # # 새로운 필터링 로직 추가
            # filtered_peaks_dates = filtered_peaks["Date"].dt.to_pydatetime()  # 변곡점 날짜를 datetime으로 변환
            # to_remove = set()


            # for i, date in enumerate(filtered_peaks_dates):
            # # 현재 변곡점 이후 3개월 이내의 변곡점 찾기
            #     three_months_later = date + pd.DateOffset(months=4)
            #     for j in range(i + 1, len(filtered_peaks_dates)):
            #         if filtered_peaks_dates[j] <= three_months_later:
            #             to_remove.add(j)  # 3개월 이내의 변곡점 인덱스를 추가

            # # 제거할 변곡점을 제외한 filtered_peaks 생성
            # filtered_peaks = filtered_peaks.drop(filtered_peaks.index[list(to_remove)])
            final_filtered_peaks = []  # 최종 변곡점을 저장할 리스트
            remaining_peaks = filtered_peaks.copy()
            while not remaining_peaks.empty:
                current_date = remaining_peaks.iloc[0]["Date"]
                four_months_before = current_date - pd.DateOffset(months=4)
                four_months_after = current_date + pd.DateOffset(months=4)

                # 4개월 내 변곡점 찾기
                candidates = remaining_peaks[
                    (remaining_peaks["Date"] >= four_months_before) & 
                    (remaining_peaks["Date"] <= four_months_after)
                ]

                if not candidates.empty:
                    # 최고점 찾기
                    max_peak = candidates.loc[candidates["High"].idxmax()]
                    final_filtered_peaks.append({"Date": max_peak["Date"], "High": max_peak["High"]})

                    # 해당 범위(±4개월) 내 변곡점 제거
                    remaining_peaks = remaining_peaks[
                        (remaining_peaks["Date"] < max_peak["Date"] - pd.DateOffset(months=4)) | 
                        (remaining_peaks["Date"] > max_peak["Date"] + pd.DateOffset(months=4))
                    ]
                else:
                    break  # 후보가 없으면 종료

            # 리스트를 DataFrame으로 변환
            final_peaks_df = pd.DataFrame(final_filtered_peaks)
            
            # 날짜를 문자열 형식(YYYY-MM-DD)으로 변환
            final_peaks_df["Date"] = final_peaks_df["Date"].dt.strftime("%Y-%m-%d")
            peak_dates1["Date"] = peak_dates1["Date"].dt.strftime("%Y-%m-%d")

            return peak_dates1, peak_prices, final_peaks_df

            
        except Exception as e:
            print(f"find_peaks_combined 처리 중 에러 발생: {str(e)}")
            import traceback
          
            return [], [], pd.DataFrame(columns=['Date', 'High'])
        
    def filter_peaks(self, filtered_peaks):
        final_filtered_peaks = []  # 최종 변곡점을 저장할 리스트
        remaining_peaks = filtered_peaks.copy()  # 변곡점 리스트 복사본 유지

        while not remaining_peaks.empty:
            current_date = remaining_peaks.iloc[0]["Date"]
            four_months_before = current_date - pd.DateOffset(months=4)
            four_months_after = current_date + pd.DateOffset(months=4)

            # 앞뒤 4개월 내 변곡점 찾기
            candidates = remaining_peaks[
                (remaining_peaks["Date"] >= four_months_before) & 
                (remaining_peaks["Date"] <= four_months_after)
            ]

            if not candidates.empty:
                # 해당 구간에서 최고점 찾기
                max_peak = candidates.loc[candidates["High"].idxmax()]

                # 최고점을 리스트에 추가
                final_filtered_peaks.append({"Date": max_peak["Date"], "High": max_peak["High"]})

                # 선택된 최고점의 ±4개월 내 변곡점 제거 (즉, 해당 범위 내 변곡점들은 다시 비교되지 않도록 함)
                remaining_peaks = remaining_peaks[
                    (remaining_peaks["Date"] < max_peak["Date"] - pd.DateOffset(months=4)) | 
                    (remaining_peaks["Date"] > max_peak["Date"] + pd.DateOffset(months=4))
                ]
            else:
                # 후보가 없으면 종료
                break
        
    
    async def Stock_Data(self):
        async with aiohttp.ClientSession() as session:
            try:
                response = requests.get("http://localhost:4000/stock-data/get_all_codes")
                data = response.json()
                all_codes=["002790"] # 리스트 형태일 경우
                #all_codes = [item['code'] for item in data]
             
                total_batches = (len(all_codes) + 9) // 10

                # 100개 단위로 tr_code 처리
                for batch_index, tr_code_batch in enumerate(self.chunks(all_codes, 10), start=1):
                    print(f"처리 중인 배치: {batch_index}/{total_batches}")
                    try:
                        # 각 배치에 대해 데이터 가져오기
                        all_stock_data = self.get_stock_data_all(tr_code_batch)
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

            except Exception as e:
                print(f"서버 통신 오류: {str(e)}")
        
            # 모든 주식 코드 추출

           
        
    async def process_stock_data(self, code, stock_data, session, peak_dates, peak_prices, filtered_peaks):
        try:
            # DataFrame을 리스트로 변환
            data_list = stock_data.to_dict('records')
            # peak_dates가 DataFrame이 아닐 경우 처리
         
         
            peak_prices_list = [{'Price': price} for price in peak_prices]  # 리스트를 딕셔너리 형태로 변환
            filtered_peaks_list = filtered_peaks.reset_index().to_dict('records') if not filtered_peaks.empty else []  # 빈 리스트로 초기화
            peak_dates_list = peak_dates.reset_index().to_dict('records') if not filtered_peaks.empty else []  # 빈 리스트로 초기화
            
       
            async with session.post("http://127.0.0.1:8000/stock_data_collection/",
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


