import numpy as np
from kiwoom_api import KiwoomAPI
from pykiwoom.kiwoom import Kiwoom

import asyncio

import pythoncom
import telegram
import pandas as pd
from PyQt5.QAxContainer import *
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from pykiwoom.kiwoom import *
import aiohttp
import time


import asyncio
from datetime import datetime, timedelta
import time
import schedule
import pandas as pd
from Api import Api
from gui import Program_Gui
from kiwoom_api import KiwoomAPI
from  Auth.Login import Auth
from PyQt5.QtWidgets import QApplication
import sys
from scipy.signal import argrelextrema

class FivoTrade:
    def __init__(self, kiwoom):
        self.kiwoom = kiwoom  # 기존 로그인된 키움 객체
        self.loop = asyncio.get_event_loop()
        self.trend_lines_by_code = {}
        self.price_margin = 100
        self.alert_cooldown = {}
        self.stock_dataframes = {} 
        self.fids = ["10"]  # 현재가
        self.alert_history = {}  # 코드별 마지막 알람 시간을 저장할 딕셔너리
        
        # 키움 객체의 내부 QAxWidget에 이벤트 핸들러 연결
        self.kiwoom.ocx.OnReceiveRealData.connect(self._receive_real_data)
        
        # 텔레그램 설정
        self.telegram_token = '7530225524:AAHxEprH6pjGkuqaEwU7lteqSMopp2LHFDw'
        self.telegram_chat_id = '7103296678'
        self.telegram_bot = None
        self.setup_telegram()
        self.base_url = "http://127.0.0.1:8000"

    def setup_telegram(self):
        """텔레그램 봇 초기화"""
        try:
            self.telegram_bot = telegram.Bot(token=self.telegram_token)
            print("텔레그램 봇 연결 성공!")
        except Exception as e:
            print(f"텔레그램 봇 연결 실패: {str(e)}")
            self.telegram_bot = None

    def adjust_price(self,   price):
        if price <= 2000:
            return price
        elif 2000 < price <= 5000:
            return round(price / 5) * 5
        elif 5000 < price <= 20000:
            return round(price / 10) * 10
        elif 20000 < price <= 50000:
            return round(price / 50) * 50
        elif 50000 < price <= 200000:
            return round(price / 100) * 100
        elif 200000 < price <= 500000:
            return round(price / 500) * 500
        else:
            return round(price / 1000) * 1000
        
    def get_price_margin(self, price):
        if price <= 2000:
            return 10  # 예시: 10원
        elif 2000 < price <= 5000:
            return 20  # 예시: 20원
        elif 5000 < price <= 20000:
            return 50  # 예시: 50원
        elif 20000 < price <= 50000:
            return 100  # 예시: 100원
        elif 50000 < price <= 200000:
            return 200  # 예시: 200원
        elif 200000 < price <= 500000:
            return 500  # 예시: 500원
        else:
            return 1000  # 예시: 1000원
        

    def queue_telegram_message(self, code, current_price, trend_price, line_type):
        """텔레그램 메시지 큐에 추가"""
        message = f"🔔 {line_type} 근접 알림!\n\n"
        message += f"종목코드: {code}\n"
        message += f"현재가격: {current_price:,}원\n"
        message += f"{line_type} 가격: {trend_price:,}원\n"
        message += f"시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        # 비동기 이벤트 루프에서 메시지 전송
        asyncio.get_event_loop().create_task(self.send_telegram_message(message))


    async def send_error_message(self, error_type, details):
        """에러 메시지 텔레그램 전송"""
        try:
            if self.telegram_bot is None:
                print("텔레그램 봇이 초기화되지 않았습니다.")
                return
                
            message = f"⚠️ 에러 발생\n\n"
            message += f"유형: {error_type}\n"
            message += f"상세: {details}"
            
            await self.telegram_bot.send_message(
                chat_id=self.telegram_chat_id,
                text=message
            )
            print(f"에러 메시지 전송 완료: {error_type}")
            
        except Exception as e:
            print(f"에러 메시지 전송 실패: {str(e)}")

    async def send_telegram_message(self, message):
        """텔레그램 메시지 전송"""
        try:
            if self.telegram_bot is None:
                print("텔레그램 봇이 초기화되지 않았습니다.")
                return
                
            await self.telegram_bot.send_message(
                chat_id=self.telegram_chat_id,
                text=message
            )
            print("텔레그램 메시지 전송 완료")
            
        except Exception as e:
            print(f"텔레그램 메시지 전송 실패: {str(e)}")
   
    async def surveillance(self):
        """종목 분석 수행"""
        try:
            # 서버에서 종목 코드 가져오기
            async with aiohttp.ClientSession() as session:
                async with session.get("http://localhost:4000/stock-data/get_true_codes") as response:
                    if response.status == 200:
                        data = await response.json()
                    
                        all_codes =["002790"]
                        #all_codes = [item['code'] for item in data] # 전체 종목 코드
                    else:
                        raise Exception(f"API 호출 실패: {response.status}")
                    
            # 2. 종목 분석 수행
            for code in all_codes:
            
                await self.analyze_stock(code)
            # 성공한 종목 코드에 대해서만 실시간 등록 수행
            try:
               
                all_codes = list(self.trend_lines_by_code.keys())  # 모든 종목 코드 가져오기
                total_codes = len(all_codes)

                for i in range(0, total_codes, 100):
                        chunk_codes = all_codes[i:i + 100]
                        screen_no = f"01{str(i // 100).zfill(2)}"
                        codes_string = ";".join(chunk_codes)

                        print(f"화면번호: {screen_no}")
                        print(f"종목 수: {len(chunk_codes)}")

                        self.kiwoom.ocx.dynamicCall(
                            "SetRealReg(QString, QString, QString, QString)",
                            screen_no, codes_string, ";".join(self.fids), "0"
                        )
                        print(f"실시간 등록 완료: {codes_string}")
                        await asyncio.sleep(3.6)

                print(f"전체 {total_codes}개 종목 실시간 등록 완료")

            except Exception as e:
                error_msg = f"실시간 등록 프로세스 에러\n에러 내용: {str(e)}"
                await self.send_error_message("시스템 에러", error_msg)
                return {}
        
                    
        except Exception as e:
            error_msg = f"전체 감시 프로세스 에러\n에러 내용: {str(e)}"
            await self.send_error_message("시스템 에러", error_msg)
            return {}

   

    def Trade_Start(self):
        try:
            # 1. 초기 분석 수행 및 실시간 등록
            async def run_surveillance():
                return await self.surveillance()
            asyncio.get_event_loop().run_until_complete(run_surveillance())
            print("result",self.trend_lines_by_code)

            # 2. 이벤트 루프 유지 (실시간 데이터 수신을 위해)
            while True:
                pythoncom.PumpMessages()  # COM 이벤트 처리
                
        except Exception as e:
            print(f"시스템 시작 실패: {str(e)}")
            import traceback
            traceback.print_exc()

    async def analyze_stock(self, code):
        """개별 종목 분석"""
        try:
            fib_channel_info=[]
            reference_dates=[]
            match = []
            async with aiohttp.ClientSession() as session:
                async with session.post("http://localhost:4000/stock-data/get_stock_data",json={'code': code}) as response:
                    df = await response.json()
                    data = pd.DataFrame(df['data'])
                    data["Date"] = pd.to_datetime(data["Date"]) 
                    avg_daily_volume = data["Avg_Daily_Volume"][0]
                    if not df['data']:  # 데이터가 비어있는 경우 체크
                        print(f"종목 {code}: 데이터가 비어있습니다")
                        return None
           
                    peak_dates1, peak_prices1, filtered_peaks = self.find_peaks_combined(data)
                    async with session.get("http://localhost:4000/stock-data/get_user_inflection",json={'code': code}) as response:
                        date = await response.json()
                        print(date)
                    
                      
                        # 날짜와 가격을 함께 저장
                        reference_dates_with_prices = [(int(item['date']), int(item['price'])) for item in date]
                        print(reference_dates_with_prices)
                        
                    
                                        
                        # highdate가 존재하는 경우, peak_dates1에서 같은 값 찾기
    
                        for item in date:
                           
                            highdate = item.get("highdate")  # highdate가 없으면 None 반환
                      
                            if highdate:  # highdate 값이 존재할 때만 처리
                                # highdate를 변환하여 새로운 변수에 저장
                                highdate_dt = pd.to_datetime(highdate, format="%Y%m%d")  # YYYYMMDD → YYYY-MM-DD 변환

                                # 변환된 날짜를 YYYY-MM-DD 형식의 문자열로 변환하여 match에 추가
                                match.append(highdate_dt.strftime("%Y-%m-%d"))
                         
                            else:
                                match.append(None)  # highdate 자체가 없으면 None 추가

                    for i, reference_date in enumerate(reference_dates_with_prices):
                        if match[i] is not None:
                            # match[i]가 문자열일 경우 datetime으로 변환
                            if isinstance(match[i], str):
                                previous_peak_date = pd.to_datetime(match[i])
                            else:
                                previous_peak_date = match[i]
                        else:
                            previous_peak_date, previous_peak_price = self.find_previous_peak(
                                data, pd.to_datetime(peak_dates1["Date"]), peak_prices1, reference_date[0]
                            )
                        
                        closest_date, closest_price = self.find_closest_inflection_or_peak(
                            filtered_peaks, peak_dates1, peak_prices1, reference_date[0], reference_date[1]
                        )
              
                     

                        if previous_peak_date is None:
                            continue

                        if closest_date is None:
                            # 첫 번째와 두 번째 날짜만 사용
                            selected_dates = [
                                int(previous_peak_date.strftime('%Y%m%d')),
                                reference_date[0]
                            ]
                        else:
                            selected_dates = [
                                int(previous_peak_date.strftime('%Y%m%d')),
                                reference_date[0],
                                int(closest_date.strftime('%Y%m%d'))
                            ]
                    
                        selected_rows = data[data["Date"].isin(pd.to_datetime(selected_dates, format='%Y%m%d'))]
                       
        
                        selected_rows = selected_rows.sort_values(by="Date")
                        print("selected_rows",selected_rows)
                    

                        dates_index = selected_rows.index.tolist()
                        highs = selected_rows["High"].values

                        latest_index = data.index[-1]
                        x_vals = np.linspace(dates_index[0], latest_index, 200)
                     
                        slope = (highs[1] - highs[0]) / (dates_index[1] - dates_index[0])
                        base_trend = slope * (x_vals - dates_index[0]) + highs[0]
                        fib_channel_info.append(int(base_trend[-1]))  # Base Trend 가격 추가
                        


                        if closest_date is not None:
                            fib_levels = [1, 2, 3, 4]
                            price_at_third = slope * (dates_index[2] - dates_index[0]) + highs[0]
                            channel_height = highs[2] - price_at_third

                            channels = {level: base_trend + channel_height * level for level in fib_levels}

                            # 피보나치 선의 가격 출력
                            for level, value in channels.items():
                           
                                fib_channel_info.append(int(value[-1]))  # 리스트가 아닌 값이므로 바로 변환

                    
                    self.trend_lines_by_code[code] = {
                        "adjusted_prices": fib_channel_info,
                        "avg_daily_volume": avg_daily_volume
                    }
            

                
        except Exception as e:
            print(f"종목 {code} 분석 중 에러: {str(e)}\n상세 정보: {type(e).__name__}")
            return None
            
    
    def find_previous_peak(self, df, peak_dates1, peak_prices1, reference_date):
 
    
        if not isinstance(reference_date, pd.Timestamp):
            reference_date = pd.to_datetime(str(reference_date), format='%Y%m%d')
        
        previous_peaks = [(date, price) for date, price in zip(peak_dates1, peak_prices1) if date < reference_date]
        
        if not previous_peaks:
            return None, None
    
        latest_peak_date, latest_peak_price = max(previous_peaks, key=lambda x: x[0])
   
        
        return latest_peak_date, latest_peak_price

    def find_closest_inflection_or_peak(self, filtered_peaks, peak_dates1, peak_prices1, reference_date, reference_price):  

        # reference_date를 Timestamp로 변환
        if not isinstance(reference_date, pd.Timestamp):
            reference_date = pd.to_datetime(str(reference_date), format='%Y%m%d')

        # filtered_peaks에서 조건에 맞는 데이터 필터링
        future_inflections = filtered_peaks[
            (filtered_peaks['Date'] > reference_date) & 
            (filtered_peaks['High'] > reference_price)
        ]

        # peak_dates1에서 조건에 맞는 데이터 필터링
        future_peaks = peak_dates1[
            (peak_dates1['Date'] > reference_date) & 
            (peak_dates1['High'] > reference_price)
        ]

        # 가장 가까운 변곡점과 고점 찾기
        closest_inflection = future_inflections.iloc[0] if not future_inflections.empty else None
        closest_peak = future_peaks.iloc[0] if not future_peaks.empty else None

        # 두 날짜 중 reference_date와 가장 가까운 것 선택
        if closest_inflection is not None and closest_peak is not None:
            inflection_diff = abs(closest_inflection['Date'] - reference_date)
            peak_diff = abs(closest_peak['Date'] - reference_date)
            
            if inflection_diff < peak_diff:
                return closest_inflection['Date'], closest_inflection['High']
            else:
                return closest_peak['Date'], closest_peak['High']

        elif closest_inflection is not None:
            return closest_inflection['Date'], closest_inflection['High']

        elif closest_peak is not None:
            return closest_peak['Date'], closest_peak['High']

        return None, None
    # 중복 제거 함수
    def remove_duplicates(self,initial_peaks, peak_indices1):
            seen = set(peak_indices1)
            return [x for x in initial_peaks if x not in seen or seen.remove(x)]
    
    def find_peaks_combined(self,df):
        # 1. 주요 고점 찾기
        peaks1 = self.find_peaks(df, 'High', compare_window=23, threshold=0.2)
        peak_indices1 = [idx for idx, _ in peaks1]
        peak_dates1 = df.iloc[peak_indices1][["Date", "High"]]
        peak_prices1 = [price for _, price in peaks1]

        # 2. 변곡점을 한 번만 계산하고 저장
        n = 6
        initial_peaks = argrelextrema(df["High"].values, np.greater_equal, order=n)[0]
        unique_initial_peaks =self.remove_duplicates(initial_peaks, peak_indices1)
        initial_peaks_df = df.iloc[unique_initial_peaks][["Date", "High"]]
        initial_rising_peaks = initial_peaks_df[initial_peaks_df["High"].diff() > 0]
        
        # 3. 저장된 변곡점에서 고점 주변 15일 이내의 점들만 제거
        filtered_peaks = initial_rising_peaks[~initial_rising_peaks.index.map(
            lambda x: any(abs(x - peak_idx) <= 13 for peak_idx in peak_indices1)
        )]
        filtered_peaks_dates = filtered_peaks["Date"].dt.to_pydatetime()  # 변곡점 날짜를 datetime으로 변환
        to_remove = set()  # 제거할 변곡점 인덱스 집합

        for i, date in enumerate(filtered_peaks_dates):
            # 현재 변곡점 이후 3개월 이내의 변곡점 찾기
            three_months_later = date + pd.DateOffset(months=6)
            for j in range(i + 1, len(filtered_peaks_dates)):
                if filtered_peaks_dates[j] <= three_months_later:
                    to_remove.add(j)  # 3개월 이내의 변곡점 인덱스를 추가

        # 제거할 변곡점을 제외한 filtered_peaks 생성
        filtered_peaks = filtered_peaks.drop(filtered_peaks.index[list(to_remove)])

   


        
        return peak_dates1, peak_prices1, filtered_peaks


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
        
        return peaks
    
    def _receive_real_data(self, code, real_type, real_data):
        """실시간 데이터 수신"""
        try:
            if real_type == "주식체결":
                # 현재 시간 확인
                current_time = time.time()
                
                # 마지막 알람으로부터 8시간이 지났는지 확인
                if code in self.alert_history:
                    last_alert_time = self.alert_history[code]
                    time_diff = current_time - last_alert_time
                    if time_diff < 8 * 3600:  # 8시간(초 단위)
                        return  # 8시간이 지나지 않았으면 알람 보내지 않음
                
                current_price = abs(int(self.kiwoom.GetCommRealData(code, 10)))  # 현재가
                current_volume = abs(int(self.kiwoom.GetCommRealData(code, 13)))  # 거래량
      

                if code in self.trend_lines_by_code:
                    adjusted_prices = self.trend_lines_by_code[code]["adjusted_prices"]
                    avg_daily_volume = self.trend_lines_by_code[code]["avg_daily_volume"]
              

                    # current_price가 adjusted_prices의 값 중 하나와 일치하는지 확인
                    chunk_size = 5  # 5개씩 나누기
                    for i in range(0, len(adjusted_prices), chunk_size):
                        chunk = adjusted_prices[i:i + chunk_size]  # 5개씩 슬라이스
                        for index, adjusted_price in enumerate(chunk):
                            # 인덱스 조정: chunk 내의 인덱스에 chunk의 시작 인덱스를 더함
                            global_index = i + index
                            
                            if abs(current_price - adjusted_price) <= self.get_price_margin(current_price) and current_volume > avg_daily_volume:
                                print(f"Current price {current_price} is within margin of adjusted price {adjusted_price} for code {code} at global index {global_index}. 거래량 상승")
                                self.queue_telegram_message(code, current_price, adjusted_price, f"{global_index}번째 Price Alert 거래량 상승")
                                self.alert_history[code] = current_time
                        
                            elif abs(current_price - adjusted_price) <= self.get_price_margin(current_price) and current_volume < avg_daily_volume:
                                print(f"Current price {current_price} is within margin of adjusted price {adjusted_price} for code {code} at global index {global_index}. 거래량 미달")
                                self.queue_telegram_message(code, current_price, adjusted_price, f"{global_index}번째 Price Alert 거래량 미달" )
                                self.alert_history[code] = current_time
                            
                # current_price가 result의 값 중 하나와 일치하는지 확인
                # if code in self.trend_lines_by_code:
                #     adjusted_prices = self.trend_lines_by_code[code]["adjusted_prices"]
                #     avg_daily_volume = self.trend_lines_by_code[code]["avg_daily_volume"]
                #     print("adjusted_prices", adjusted_prices)
                #     print("avg_daily_volume", avg_daily_volume)

                #     # current_price가 adjusted_prices의 값 중 하나와 일치하는지 확인
                #     for index, adjusted_price in enumerate(adjusted_prices):
                #         if abs(current_price - adjusted_price) <= self.get_price_margin(current_price) and current_volume > avg_daily_volume:
                #             print(f"Current price {current_price} is within margin of adjusted price {adjusted_price} for code {code} at index {index}.")
                #             self.queue_telegram_message(code, current_price, adjusted_price, f"{index}번째 Price Alert")
                #             self.alert_history[code] = current_time
                #             print(f"Current volume: {current_volume}")  # 거래량 출력

        except Exception as e:
            print(f"실시간 데이터 처리 중 에러: {str(e)}")


def main():
    app = QApplication(sys.argv)
    Login = Auth()
    kiwoom = Login.Kiwoom_Login()
    fivo = FivoTrade(kiwoom)
    fivo.Trade_Start()
    app.exec_()



if __name__ == "__main__":
    main()

            


    

   
