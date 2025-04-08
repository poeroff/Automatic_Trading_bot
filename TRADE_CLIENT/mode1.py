#2025-03-29 제작
# import numpy as np
import aiohttp
import numpy as np
import telegram
from pykiwoom.kiwoom import Kiwoom
import pandas as pd
from PyQt5.QAxContainer import *
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from pykiwoom.kiwoom import *
import pythoncom
import asyncio
from datetime import datetime, timedelta
import time
from  Auth.Login import Auth
from PyQt5.QtWidgets import QApplication
import sys
from pyampd.ampd import find_peaks  # 정확한 경로에서 함수 가져오기


async def find_peaks(code):
    async with aiohttp.ClientSession() as session:
                async with session.post("http://localhost:4000/stock-data/ReturnHighPeak", json={'code': code}) as response:
                    response_json = await response.json()
                    return response_json

async def inflection_point(code):
     async with aiohttp.ClientSession() as session:
                async with session.post("http://localhost:4000/stock-data/ReturnInflectionPoint", json={'code': code}) as response:
                    response_json = await response.json()
                    return response_json






class Trade:
    def __init__(self, kiwoom):
        # 키움 관련
        self.kiwoom = kiwoom  # 기존 로그인된 키움 객체
        self.loop = asyncio.get_event_loop()
        self.kiwoom.ocx.OnReceiveRealData.connect(self._receive_real_data)   # 키움 객체의 내부 QAxWidget에 이벤트 핸들러 연결


        self.trend_lines_by_code = {}
        self.price_margin = 100
        self.alert_cooldown = {}
        self.stock_dataframes = {} 
        self.fids = ["10"]  # 현재가
        self.alert_history = {}  # 코드별 마지막 알람 시간을 저장할 딕셔너리
        self.all_codes = []  # 전체 종목 코드를 저장할 리스트 추가
        
        
        # 텔레그램 설정
     
        self.telegram_token = '7530225524:AAHxEprH6pjGkuqaEwU7lteqSMopp2LHFDw'
        self.telegram_chat_id = '7103296678'
        self.telegram_bot = None
        self.setup_telegram()


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


    async def analyze_stock(self, code):
        """개별 종목 분석"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post("http://localhost:4000/stock-data/StockData", json={'code': code}) as response:
                    response_json = await response.json()
                    if not response_json or 'Data' not in response_json or not response_json['Data']:
                        return 
                    # Data 키에서 실제 데이터 배열 가져오기
                    data = pd.DataFrame(response_json['Data'])
                    if len(data) < 14:
                        return
                    
                    # 날짜 변환
                    data["date"] = pd.to_datetime(data["date"])
                    HighPoint =  await find_peaks(code)
                    HighPoint = pd.DataFrame(HighPoint)
                    InflectionPoint =  await inflection_point(code)
                    InflectionPoint = pd.DataFrame(InflectionPoint)
                    InflectionPoint['highdate'] = pd.to_datetime(InflectionPoint['highdate'], format='%Y%m%d').dt.strftime('%Y-%m-%d')
                    InflectionPoint['date'] = pd.to_datetime(InflectionPoint['date'], format='%Y%m%d').dt.strftime('%Y-%m-%d')
                  
         
                    inflectionpoint_data = InflectionPoint[['highdate', 'date', 'price']]
                 

                    # HighPoint에서 date와 price 추출
                    highpoint_data = HighPoint[['date', 'price']]
                   

                    # InflectionPoint의 highdate에 맞는 HighPoint의 price를 가져오기
                    inflectionpoint_data['HighPrice'] = inflectionpoint_data['highdate'].map(highpoint_data.set_index('date')['price'])
                    rearranged_data = inflectionpoint_data[['highdate', 'HighPrice', 'date', 'price']]

                    
                    # 빈 리스트 생성하여 각 데이터 포인트의 추세선 가격을 저장
                    trend_prices_list = []

                    # 데이터 포인트 개수만큼 반복
                    for i in range(len(rearranged_data)):
                        # 빨간색 점 (HighPoint, highdate)
                        highdate_point = pd.to_datetime(rearranged_data['highdate'].iloc[i])
                        highprice_point = rearranged_data['HighPrice'].iloc[i]
                        
                        # 파란색 점 (Inflection Point, date)
                        date_point = pd.to_datetime(rearranged_data['date'].iloc[i])
                        price_point = pd.to_numeric(rearranged_data['price'].iloc[i], errors='coerce')
                        
                        # 추세선 계산
                        # 두 점: (highdate, HighPrice)와 (date, price)
                        x1 = highdate_point.to_pydatetime()  # datetime 객체로 변환
                        y1 = highprice_point
                        x2 = date_point.to_pydatetime()
                        y2 = price_point
                        
                        # 날짜를 숫자(일 단위)로 변환하여 계산
                        days_diff = (x2 - x1).days
                        slope = (y2 - y1) / days_diff  # 기울기
                        intercept = y1 - slope * (x1 - datetime(1970, 1, 1)).days  # 절편 (Unix epoch 기준)
                        
                        # 추세선 날짜 범위: highdate부터 최근 날짜(2025-03-30)까지
                        trend_dates = pd.date_range(start=highdate_point, end='2025-03-30', freq='D')
                        trend_days = [(d - datetime(1970, 1, 1)).days for d in trend_dates]
                        trend_values = [slope * day + intercept for day in trend_days]
                        
                        # 최근 날짜의 추세선 가격 저장
                        latest_trend_price = trend_values[-1]
                        trend_prices_list.append(latest_trend_price)
                        #print(f"데이터 포인트 {i+1}의 최근 날짜 (2025-03-30) 추세선 가격: {latest_trend_price:.2f}")

                    # 모든 추세선 가격을 리스트 형태로 저장
                    self.trend_lines_by_code[code] = {
                        "adjusted_prices": trend_prices_list,
                    }

                    #print(f"전체 추세선 가격 리스트: {trend_prices_list}")
            
                
        except Exception as e:
            print(f"종목 {code} 분석 중 에러: {str(e)}\n상세 정보: {type(e).__name__}")
            return None

    async def surveillance(self):
        """종목 분석 수행"""
        try:
            # 서버에서 종목 코드 가져오기
            async with aiohttp.ClientSession() as session:
                async with session.get("http://localhost:4000/stock-data/TrueCode") as response:
                    if response.status == 200:
                        data = await response.json()
                        self.all_codes = [item['code'] for item in data] # 전체 종목 코드를 인스턴스 변수에 저장
                    else:
                        raise Exception(f"API 호출 실패: {response.status}")
                    
            # 2. 종목 분석 수행
            for code in self.all_codes:
                print(code)
                await self.analyze_stock(code)
            #성공한 종목 코드에 대해서만 실시간 등록 수행
            try:
                all_codes = list(self.trend_lines_by_code.keys())  # 모든 종목 코드 가져오기
                total_codes = len(all_codes)
                print(total_codes)

                for i in range(0, total_codes, 100):
                        chunk_codes = [str(code) for code in all_codes[i:i + 100]]
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
    def _receive_real_data(self, code, real_type, real_data):
        """실시간 데이터 수신"""
        try:
            if real_type == "주식체결":
                # 현재 시간 확인
                current_time = time.time()
                
                # 마지막 알람으로부터 24시간이 지났는지 확인
                if code in self.alert_history:
                    last_alert_time = self.alert_history[code]
                    time_diff = current_time - last_alert_time
                    if time_diff < 24 * 3600:  # 24시간(초 단위)
                        return  # 24시간이 지나지 않았으면 알람 보내지 않음
                
                current_price = abs(int(self.kiwoom.GetCommRealData(code, 10)))  # 현재가      

                if code in self.trend_lines_by_code:
                    adjusted_prices = self.trend_lines_by_code[code]["adjusted_prices"]
              

                    # current_price가 adjusted_prices의 값 중 하나와 일치하는지 확인
                    chunk_size = 5  # 5개씩 나누기
                    for i in range(0, len(adjusted_prices), chunk_size):
                        chunk = adjusted_prices[i:i + chunk_size]  # 5개씩 슬라이스
                        for index, adjusted_price in enumerate(chunk):
                            # 인덱스 조정: chunk 내의 인덱스에 chunk의 시작 인덱스를 더함
                            global_index = i + index
                            
                            if abs(current_price - adjusted_price) <= self.get_price_margin(current_price):
                                print(f"Current price {current_price} is within margin of adjusted price {adjusted_price} for code {code} at global index {global_index}. 거래량 상승")
                                self.queue_telegram_message(code, current_price, adjusted_price, f"{global_index}번째 Price Alert 거래량 상승")
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
    fivo = Trade(kiwoom)
    fivo.Trade_Start()
    app.exec_()



if __name__ == "__main__":
    main()