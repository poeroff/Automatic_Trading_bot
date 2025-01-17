from kiwoom_api import KiwoomAPI
from pykiwoom.kiwoom import Kiwoom
from trading_technique import Trading_Technique
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

class Trade:
    def __init__(self, kiwoom):
        self.kiwoom = kiwoom  # 기존 로그인된 키움 객체
        self.Kiwoom_OpenAPI = KiwoomAPI(self.kiwoom)
        self.Trading_Technique = Trading_Technique()
        self.loop = asyncio.get_event_loop()
        self.trend_lines_by_code = {}
        self.price_margin = 100
        self.alert_cooldown = {}
        self.stock_dataframes = {} 
        self.fids = ["10"]  # 현재가
        
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

    async def send_alert(self, code, current_price, trend_price, line_type):
        """알람 전송"""
        try:
            message = f"🔔 {line_type} 근접 알림!\n\n"
            message += f"종목코드: {code}\n"
            message += f"현재가격: {current_price:,}원\n"
            message += f"{line_type} 가격: {trend_price:,}원\n"
            message += f"시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            # 텔레그램 봇을 사용하여 메시지 전송
            await self.telegram_bot.send_message(
                chat_id=self.telegram_chat_id,
                text=message
            )
        except Exception as e:
            print(f"알람 전송 중 에러: {str(e)}")

   
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

            total_codes = len(all_codes)
            start_msg = f"분석 시작\n전체 종목 수: {total_codes}"
            await self.telegram_bot.send_message(chat_id=self.telegram_chat_id, text=start_msg)
            
            all_trend_lines = {}
            failed_codes = []
            successful_codes = []  # 성공한 종목 코드를 저장할 배열

            # 2. 종목 분석 수행
            for code in all_codes:
                try:
                    result = await self.analyze_stock(code)
                    if result:
                        all_trend_lines.update(result)
                        successful_codes.append(code)  # 성공한 종목 코드 추가
                        print(f"종목 {code} 분석 성공")
                    else:
                        failed_codes.append(code)
                        print(f"종목 {code} 분석 실패")
                except Exception as e:
                    error_msg = f"종목 분석 실패: {code}\n에러 내용: {str(e)}"
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

            return all_trend_lines
                    
        except Exception as e:
            error_msg = f"전체 감시 프로세스 에러\n에러 내용: {str(e)}"
            await self.send_error_message("시스템 에러", error_msg)
            return {}

    async def analyze_stock(self, code):
        """개별 종목 분석"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/get_stock_data/",
                    json={'code': code}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data['status'] == 'success':
                            df = pd.DataFrame(data['data'])
                            df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y%m%d').astype(int)
                            self.stock_dataframes[code] = df
                            peaks = self.Trading_Technique.find_peaks(df)
                            waves = self.Trading_Technique.analyze_waves(df, peaks)
                            filtered_waves, filtered_peaks = self.Trading_Technique.filter_waves(waves, peaks)
                            trend_lines = self.Trading_Technique.generate_trend_lines(df, filtered_peaks, filtered_waves)
                            return {code: trend_lines}
                    else:
                        print(f"API 호출 실패: {response.status}")
                        return None
                    
        except Exception as e:
            print(f"종목 {code} 분석 중 에러: {str(e)}")
            return None

    def _receive_real_data(self, code, real_type, real_data):
        """실시간 데이터 수신"""
        try:
            if real_type == "주식체결":
                current_price = abs(int(self.kiwoom.GetCommRealData(code, 10)))  # 절대값 처리
                closest_trend, closest_parallel = self.find_closest_line(code, current_price)
                if closest_trend is not None:
                    closest_trend = self.adjust_price(closest_trend)
                    closest_trend = int(closest_trend)
            
                if closest_parallel is not None:
                    closest_parallel = self.adjust_price(closest_parallel)
                    closest_parallel = int(closest_parallel)
                
                price_margin = self.get_price_margin(current_price)

                # 알람 조건 설정
                if closest_trend is not None and abs(current_price - closest_trend) <= price_margin:
                    print(f"저항선 알람 조건 만족: {code}")
                    #self.send_alert(code, current_price, closest_trend, "저항선")
                
                if closest_parallel is not None and abs(current_price - closest_parallel) <= price_margin:
                    print(f"지지선 알람 조건 만족: {code}")
                    #self.send_alert(code, current_price, closest_parallel, "지지선")

        except Exception as e:
            print(f"실시간 데이터 처리 중 에러: {str(e)}")

    def find_closest_line(self, code, current_price):
        if code not in self.trend_lines_by_code:
            return None, None

        trend_lines = self.trend_lines_by_code[code]
        current_idx = len(self.stock_dataframes[code]) - 1

        closest_trend = None
        closest_parallel = None
        min_trend_diff = float('inf')
        min_parallel_diff = float('inf')

        # 추세선에서 가장 가까운 선 찾기
        for trend in trend_lines.get('trends', []):
            slope = trend["slope"]
            intercept = trend["start"][1] - slope * trend["start"][0]
            trend_price = slope * current_idx + intercept
            diff = abs(current_price - trend_price)
            
            if diff < min_trend_diff:
                min_trend_diff = diff
                closest_trend = trend_price

        # 평행선에서 가장 가까운 선 찾기
        for parallel in trend_lines.get('parallels', []):
            slope = parallel["slope"]
            intercept = parallel["intercept"]
            parallel_price = slope * current_idx + intercept
            diff = abs(current_price - parallel_price)
            
            if diff < min_parallel_diff:
                min_parallel_diff = diff
                closest_parallel = parallel_price

        return closest_trend, closest_parallel

    def Trade_Start(self):
        try:
            # 1. 초기 분석 수행 및 실시간 등록
            async def run_surveillance():
                return await self.surveillance()
                
            result = asyncio.get_event_loop().run_until_complete(run_surveillance())
            print("\n=== 분석된 저항선/지지선 정보 ===")
            for code, data in result.items():
                
                trends = data.get('trends', [])
                parallels = data.get('parallels', [])
                
                
                # 실제 가격값이 있는 데이터만 필터링
                valid_trends = [t for t in trends if t and t.get('start') and t.get('end')]
                valid_parallels = [p for p in parallels if p and p.get('start') and p.get('slope') is not None]
                
                if not valid_trends and not valid_parallels:
                    print(f"경고: {code} 종목의 유효한 추세선/지지선이 없습니다.")
                    continue
                    
                # 분석 결과 저장 (유효한 데이터만)
                self.trend_lines_by_code[code] = {
                    "trends": valid_trends,
                    "parallels": valid_parallels
                }
    
            if not self.trend_lines_by_code:
                print("유효한 분석 결과가 없습니다.")
                return
            
                
            
            # 2. 이벤트 루프 유지 (실시간 데이터 수신을 위해)
            while True:
                pythoncom.PumpMessages()  # COM 이벤트 처리
                
        except Exception as e:
            print(f"시스템 시작 실패: {str(e)}")
            import traceback
            traceback.print_exc()
            


    

   
