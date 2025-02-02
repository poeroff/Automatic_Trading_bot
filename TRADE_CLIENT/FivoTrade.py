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
                async with session.get(f"{self.base_url}/get_all_codes/") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data['status'] == 'success':
                            all_codes = data['codes']  # 전체 종목 코드
                        else:
                            raise Exception("종목 코드 조회 실패")
                    else:
                        raise Exception(f"API 호출 실패: {response.status}")
            failed_codes = []
            successful_codes = []  # 성공한 종목 코드를 저장할 배열
            # 2. 종목 분석 수행
            for code in all_codes:
                try:
                    result, avg_daily_volume = await self.analyze_stock(code)
               
                  
                    if len(result) > 0:
                        successful_codes.append(code)
                        print(f"종목 {code} 분석 성공")


                    else:
                        failed_codes.append(code)
                        print(f"종목 {code} 분석 실패 - 결과 없음")

                except Exception as e:
                    error_msg = f"종목 분석 실패: {code}\n에러 내용: {str(e)}\n"
                    await self.send_error_message("종목 분석 에러", error_msg)
                    failed_codes.append(code)

            # 성공한 종목 코드에 대해서만 실시간 등록 수행
            try:
                for i in range(0, len(successful_codes), 100):
                    chunk_codes = successful_codes[i:i+100]
                    screen_no = f"01{str(i//100).zfill(2)}"
                    codes_string = ";".join(chunk_codes)
                    
                    print(f"화면번호: {screen_no}")
                    print(f"종목 수: {len(chunk_codes)}")
                    
                    self.kiwoom.ocx.dynamicCall(
                        "SetRealReg(QString, QString, QString, QString)", 
                        screen_no, codes_string, ";".join(self.fids), "0"
                    )
                    print(f"실시간 등록 완료: {codes_string}")
                    await asyncio.sleep(3.6)

                print(f"전체 {len(successful_codes)}개 종목 실시간 등록 완료")

            except Exception as e:
                error_msg = f"실시간 등록 프로세스 에러\n에러 내용: {str(e)}"
                await self.send_error_message("시스템 에러", error_msg)
                return {}
        
            return result,avg_daily_volume
                    
        except Exception as e:
            error_msg = f"전체 감시 프로세스 에러\n에러 내용: {str(e)}"
            await self.send_error_message("시스템 에러", error_msg)
            return {}

   

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
                current_volume = abs(int(self.kiwoom.GetCommRealData(code, 11)))  # 거래량

                # current_price가 result의 값 중 하나와 일치하는지 확인
                if code in self.trend_lines_by_code:
                    adjusted_prices = self.trend_lines_by_code[code]["adjusted_prices"]
                    avg_daily_volume = self.trend_lines_by_code[code]["avg_daily_volume"]
                    print("adjusted_prices", adjusted_prices)
                    print("avg_daily_volume", avg_daily_volume)

                    # current_price가 adjusted_prices의 값 중 하나와 일치하는지 확인
                    for index, adjusted_price in enumerate(adjusted_prices):
                        if abs(current_price - adjusted_price) <= self.get_price_margin(current_price) and current_volume > avg_daily_volume:
                            print(f"Current price {current_price} is within margin of adjusted price {adjusted_price} for code {code} at index {index}.")
                            self.queue_telegram_message(code, current_price, adjusted_price, f"{index}번째 Price Alert")
                            self.alert_history[code] = current_time
                            print(f"Current volume: {current_volume}")  # 거래량 출력

        except Exception as e:
            print(f"실시간 데이터 처리 중 에러: {str(e)}")



    def Trade_Start(self):
        try:
            # 1. 초기 분석 수행 및 실시간 등록
            async def run_surveillance():
                return await self.surveillance()
                
            result, avg_daily_volume = asyncio.get_event_loop().run_until_complete(run_surveillance())
            
            for code, data in result.items():
                adjusted_prices = [self.adjust_price(price) for price in data]
                # adjusted_prices와 avg_daily_volume을 함께 저장
                self.trend_lines_by_code[code] = {
                    "adjusted_prices": adjusted_prices,
                    "avg_daily_volume": avg_daily_volume
                }

       
        
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
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/get_stock_data/",
                    json={'code': code}
                ) as response:
                    if response.status == 200:
                        df = await response.json()
                        data = pd.DataFrame(df['data'])
                        data["Date"] = pd.to_datetime(data["Date"]) 
                        avg_daily_volume = data["Avg_Daily_Volume"][0]
                        if  df['status'] == 'success':
                            if not df['data']:  # 데이터가 비어있는 경우 체크
                                print(f"종목 {code}: 데이터가 비어있습니다")
                                return None
                            peak_dates1, peak_prices1, filtered_peaks = self.find_peaks_combined(data)
                            reference_dates = [20141027]
                            for i, reference_date in enumerate(reference_dates):
                                previous_peak_date, previous_peak_price = self.find_previous_peak(data, pd.to_datetime(peak_dates1), peak_prices1, reference_date)
                                closest_date, closest_price = self.find_closest_inflection_or_peak(filtered_peaks,pd.to_datetime(peak_dates1), peak_prices1, reference_date)
                          
                                if previous_peak_date is None:
                                    print(f"Skipping reference date {reference_date} due to missing previous peak")
                                    continue

                                if closest_date is None:
                                    # 첫 번째와 두 번째 날짜만 사용
                                    selected_dates = [
                                        int(previous_peak_date.strftime('%Y%m%d')),
                                        reference_date
                                    ]
                                else:
                                    selected_dates = [
                                        int(previous_peak_date.strftime('%Y%m%d')),
                                        reference_date,
                                        int(closest_date.strftime('%Y%m%d'))
                                    ]
                         
                                selected_rows = data[data["Date"].isin(pd.to_datetime(selected_dates, format='%Y%m%d'))]
                
                                selected_rows = selected_rows.sort_values(by="Date")
                           

                                dates_index = selected_rows.index.tolist()
                                highs = selected_rows["High"].values

                                latest_index = data.index[-1]
                                x_vals = np.linspace(dates_index[0], latest_index, 200)
                                slope = (highs[1] - highs[0]) / (dates_index[1] - dates_index[0])
                                base_trend = slope * (x_vals - dates_index[0]) + highs[0]
                                fib_channel_info=[]
                                fib_channel_info.append(int(base_trend[-1]))  # Base Trend 가격 추가



                                if closest_date is not None:
                                    fib_levels = [1, 2, 3, 4]
                                    time_diff = dates_index[2] - dates_index[0]
                                    price_at_third = slope * (dates_index[2] - dates_index[0]) + highs[0]
                                    channel_height = highs[2] - price_at_third

                                    channels = {level: base_trend + channel_height * level for level in fib_levels}

                                    # 피보나치 선의 가격 출력
                                    for level, values in channels.items():
                                        fib_channel_info.append(int(values[-1]))  # 피보나치 레벨 추가
                            
                            return {code: fib_channel_info}, avg_daily_volume
                        else:
                            print(f"종목 {code}: API 응답 실패 - {data.get('message', '알 수 없는 오류')}")
                            return None

                    else:
                        print(f"종목 {code}: API 호출 실패 - 상태 코드 {response.status}")
                        return None
                
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

    def find_closest_inflection_or_peak(self,filtered_peaks, peak_dates1, peak_prices1, reference_date):
   
        if not isinstance(reference_date, pd.Timestamp):
            reference_date = pd.to_datetime(str(reference_date), format='%Y%m%d')
           
        future_inflections = filtered_peaks[filtered_peaks['Date'] > reference_date]
     
      

        # reference_date 이후의 주요 고점 필터링
        future_peaks = peak_dates1[peak_dates1 > reference_date]
      
        # 가장 가까운 변곡점 찾기
        closest_inflection = future_inflections.iloc[0] if not future_inflections.empty else None

        # 가장 가까운 주요 고점 찾기
        closest_peak = future_peaks.iloc[0] if not future_peaks.empty else None

        # peak_prices1을 Series로 변환 (이게 핵심 해결 방법)
        peak_prices_series = pd.Series(peak_prices1, index=peak_dates1)

        # 두 개 중 reference_date와 가장 가까운 것 선택
        if closest_inflection is not None and closest_peak is not None:
            if abs(closest_inflection['Date'] - reference_date) < abs(closest_peak - reference_date):
                return closest_inflection['Date'], closest_inflection['High']
            else:
                return closest_peak, peak_prices_series.loc[closest_peak]

        elif closest_inflection is not None:
            return closest_inflection['Date'], closest_inflection['High']

        elif closest_peak is not None:
            return closest_peak, peak_prices_series.loc[closest_peak]

        return None, None


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
        
        # 2. 이전 고점보다 낮은 고점 제거
        peak_dates1 = df.iloc[peak_indices1]["Date"]
        peak_prices1 = [price for _, price in peaks1]
        
        
        return peak_dates1, peak_prices1, filtered_peaks


    def find_peaks(self, dataframe, high_column='High', compare_window=23, threshold=0.2):
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


def main():
    app = QApplication(sys.argv)
    Login = Auth()
    kiwoom = Login.Kiwoom_Login()
    fivo = FivoTrade(kiwoom)
    fivo.Trade_Start()
    app.exec_()



if __name__ == "__main__":
    main()

            


    

   
