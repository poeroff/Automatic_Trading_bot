#2025-03-29 제작
# import numpy as np
import aiohttp
from matplotlib import pyplot as plt
import numpy as np
from kiwoom_api import KiwoomAPI
from pykiwoom.kiwoom import Kiwoom
import pandas as pd
from PyQt5.QAxContainer import *
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from pykiwoom.kiwoom import *
import asyncio
from datetime import datetime, timedelta
import time
import pandas as pd
from Api import Api
from gui import Program_Gui
from kiwoom_api import KiwoomAPI
from  Auth.Login import Auth
from PyQt5.QtWidgets import QApplication
import sys
from scipy.signal import argrelextrema
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

import matplotlib.pyplot as plt
import pandas as pd
import matplotlib.dates as mdates

# rearranged_data는 이미 코드에서 생성되었다고 가정
# 형식: highdate, HighPrice, date, price 컬럼이 있는 DataFrame
def plot_stock_chart_from_entity(day_stock_data):
    # 'day_stock_data'는 DayStockData 엔티티 객체 리스트라고 가정
    data = pd.DataFrame([{
        'date': stock_data.date,
        'close': stock_data.close
    } for stock_data in day_stock_data])

    # 날짜를 x축, 종가(close)를 y축으로 설정
    plt.figure(figsize=(10, 6))
    plt.plot(data['date'], data['close'], label='Close Price', color='b', lw=2)

    # 차트 꾸미기
    plt.title('Stock Price Chart')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.grid(True)
    plt.legend()

    # 차트 표시
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

                    



class Trade:
    def __init__(self, kiwoom):
        # 키움 관련
        self.kiwoom = kiwoom  # 기존 로그인된 키움 객체
        self.loop = asyncio.get_event_loop()
        # self.kiwoom.ocx.OnReceiveRealData.connect(self._receive_real_data)   # 키움 객체의 내부 QAxWidget에 이벤트 핸들러 연결


        self.trend_lines_by_code = {}
        self.price_margin = 100
        self.alert_cooldown = {}
        self.stock_dataframes = {} 
        self.fids = ["10"]  # 현재가
        self.alert_history = {}  # 코드별 마지막 알람 시간을 저장할 딕셔너리
        self.all_codes = []  # 전체 종목 코드를 저장할 리스트 추가
        

        # 텔레그램 설정
        # self.telegram_token = '7530225524:AAHxEprH6pjGkuqaEwU7lteqSMopp2LHFDw'
        # self.telegram_chat_id = '7103296678'
        # self.telegram_bot = None
        # self.setup_telegram()
        # self.base_url = "http://127.0.0.1:8000"


    async def analyze_stock(self, code):
        """개별 종목 분석"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post("http://localhost:4000/stock-data/StockData", json={'code': code}) as response:
                    response_json = await response.json()
                    if not response_json or 'Data' not in response_json or not response_json['Data']:
                        print(f"종목 {code}: 데이터가 비어있습니다")
                        return None
                    # Data 키에서 실제 데이터 배열 가져오기
                    data = pd.DataFrame(response_json['Data'])
                    if len(data) < 14:
                        print("충분한 데이터가 없습니다.")
                        return None
                    
                    # 날짜 변환
                    data["date"] = pd.to_datetime(data["date"])
                    # 종가(close)를 기준으로 선 차트 생성
                    # plt.figure(figsize=(10, 6))
                    # plt.plot(data['date'], data['close'], label='Close Price', color='b', lw=2)

                    # # 차트 꾸미기
                    # plt.title('Stock Price Chart')
                    # plt.xlabel('Date')
                    # plt.ylabel('Price')
                    # plt.grid(True)
                    # plt.legend()

                    # # 차트 표시
                    # plt.xticks(rotation=45)
                    # plt.tight_layout()
                    # plt.show()
                  
                    HighPoint =  await find_peaks(code)
                    HighPoint = pd.DataFrame(HighPoint)
                    print("HIGHPOINT",HighPoint)
                    InflectionPoint =  await inflection_point(code)
                    InflectionPoint = pd.DataFrame(InflectionPoint)
                    InflectionPoint['highdate'] = pd.to_datetime(InflectionPoint['highdate'], format='%Y%m%d').dt.strftime('%Y-%m-%d')
                    InflectionPoint['date'] = pd.to_datetime(InflectionPoint['date'], format='%Y%m%d').dt.strftime('%Y-%m-%d')
                    print("InflectionPoint",InflectionPoint)

                    inflectionpoint_data = InflectionPoint[['highdate', 'date', 'price']]


                    # HighPoint에서 date와 price 추출
                    highpoint_data = HighPoint[['date', 'price']]

                    # InflectionPoint의 highdate에 맞는 HighPoint의 price를 가져오기
                    inflectionpoint_data['HighPrice'] = inflectionpoint_data['highdate'].map(highpoint_data.set_index('date')['price'])
                    rearranged_data = inflectionpoint_data[['highdate', 'HighPrice', 'date', 'price']]

              
                    # 종가(close)를 기준으로 선 차트 생성
                    # 종가(close)를 기준으로 선 차트 생성
                    # rearranged_data 출력으로 데이터 확인
                    print("rearranged_data:\n", rearranged_data)

                    # 종가(close)로 선 차트 그리기
                    # 종가(close)로 선 차트 그리기
                    plt.figure(figsize=(12, 6))  # 가로 크기를 늘려 최근 날짜까지 보기 좋게
                    plt.plot(data['date'], data['close'], label='Close Price', color='b', lw=2)

                    # 빨간색 점 (HighPoint, highdate)
                    highdate_points = pd.to_datetime(rearranged_data['highdate'])
                    highprice_points = rearranged_data['HighPrice']
                    plt.scatter(highdate_points, highprice_points, color='red', label='High Date', s=100, zorder=5)

                    # 파란색 점 (Inflection Point, date)
                    date_points = pd.to_datetime(rearranged_data['date'])
                    price_points = pd.to_numeric(rearranged_data['price'], errors='coerce')
                    plt.scatter(date_points, price_points, color='blue', label='Inflection Date', s=100, zorder=5)

                    # 추세선 계산
                    # 두 점: (highdate, HighPrice)와 (date, price)
                    x1 = highdate_points.iloc[0].to_pydatetime()  # datetime 객체로 변환
                    y1 = highprice_points.iloc[0]
                    x2 = date_points.iloc[0].to_pydatetime()
                    y2 = price_points.iloc[0]

                    # 날짜를 숫자(일 단위)로 변환하여 계산
                    days_diff = (x2 - x1).days
                    slope = (y2 - y1) / days_diff  # 기울기
                    intercept = y1 - slope * (x1 - datetime(1970, 1, 1)).days  # 절편 (Unix epoch 기준)

                    # 추세선 날짜 범위: highdate부터 최근 날짜(2025-03-30)까지
                    trend_dates = pd.date_range(start=highdate_points.iloc[0], end='2025-03-30', freq='D')
                    trend_days = [(d - datetime(1970, 1, 1)).days for d in trend_dates]
                    trend_prices = [slope * day + intercept for day in trend_days]

                    # 추세선 그리기
                    plt.plot(trend_dates, trend_prices, color='green', linestyle='--', label='Trend Line', lw=2)

                    # x축과 y축 범위 설정
                    all_dates = pd.concat([data['date'], highdate_points, date_points, pd.Series(trend_dates)])
                    all_prices = pd.concat([data['close'], highprice_points, price_points, pd.Series(trend_prices)])
                    date_min, date_max = all_dates.min(), all_dates.max()
                    price_min, price_max = all_prices.min(), all_prices.max()
                    margin = (price_max - price_min) * 0.1
                    plt.xlim(date_min, date_max)
                    plt.ylim(price_min - margin, price_max + margin)

                    # 차트 꾸미기
                    plt.title('Stock Price Chart with Trend Line')
                    plt.xlabel('Date')
                    plt.ylabel('Price')
                    plt.grid(True)
                    plt.legend()
                    plt.xticks(rotation=45)
                    plt.tight_layout()

                    # 차트 표시
                    plt.show()

                    # 최근 날짜의 추세선 가격 출력
                    latest_trend_price = trend_prices[-1]
                    print(f"최근 날짜 (2025-03-30)의 추세선 가격: {latest_trend_price:.2f}")
                
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
            # 성공한 종목 코드에 대해서만 실시간 등록 수행
            # try:
            #     all_codes = list(self.trend_lines_by_code.keys())  # 모든 종목 코드 가져오기
            #     total_codes = len(all_codes)

            #     for i in range(0, total_codes, 100):
            #             chunk_codes = all_codes[i:i + 100]
            #             screen_no = f"01{str(i // 100).zfill(2)}"
            #             codes_string = ";".join(chunk_codes)

            #             print(f"화면번호: {screen_no}")
            #             print(f"종목 수: {len(chunk_codes)}")

            #             self.kiwoom.ocx.dynamicCall(
            #                 "SetRealReg(QString, QString, QString, QString)",
            #                 screen_no, codes_string, ";".join(self.fids), "0"
            #             )
            #             print(f"실시간 등록 완료: {codes_string}")
            #             await asyncio.sleep(3.6)

            #     print(f"전체 {total_codes}개 종목 실시간 등록 완료")

            # except Exception as e:
            #     error_msg = f"실시간 등록 프로세스 에러\n에러 내용: {str(e)}"
            #     # await self.send_error_message("시스템 에러", error_msg)
            #     return {}
        
                    
        except Exception as e:
            error_msg = f"전체 감시 프로세스 에러\n에러 내용: {str(e)}"
            # await self.send_error_message("시스템 에러", error_msg)
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



def main():
    app = QApplication(sys.argv)
    Login = Auth()
    kiwoom = Login.Kiwoom_Login()
    fivo = Trade(kiwoom)
    fivo.Trade_Start()
    app.exec_()



if __name__ == "__main__":
    main()