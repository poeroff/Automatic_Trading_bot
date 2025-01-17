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
import sys

class Trade:
    def __init__(self, kiwoom):
        self.kiwoom = kiwoom  # 기존 로그인된 키움 객체
        self.Kiwoom_OpenAPI = KiwoomAPI(self.kiwoom)
        self.Trading_Technique = Trading_Technique()
        self.loop = asyncio.get_event_loop()
        self.trend_lines_by_code = {}
        self.price_margin = 100
        self.alert_cooldown = {}
        self.fids = ["10"]  # 현재가
        
        # 새로운 QAxWidget 생성 및 로그인
        self.kiwoom_real = QAxWidget()
        self.kiwoom_real.setControl("KHOPENAPI.KHOpenAPICtrl.1")
        self.kiwoom_real.OnEventConnect.connect(self._event_connect)  # 로그인 이벤트 연결
        self.kiwoom_real.OnReceiveRealData.connect(self._receive_real_data)
        
        # 로그인
        self.login_event_loop = QEventLoop()
        self.kiwoom_real.dynamicCall("CommConnect()")
        self.login_event_loop.exec_()  # 로그인 완료까지 대기
        
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

   
    async def surveillance(self):
        """종목 분석 수행"""
        try:
            # 서버에서 종목 코드 가져오기
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/get_all_codes/") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data['status'] == 'success':
                            all_codes = data['codes'][:100]  # 전체 종목 코드
                        else:
                            raise Exception("종목 코드 조회 실패")
                    else:
                        raise Exception(f"API 호출 실패: {response.status}")

            total_codes = len(all_codes)
            start_msg = f"분석 시작\n전체 종목 수: {total_codes}"
            await self.telegram_bot.send_message(chat_id=self.telegram_chat_id, text=start_msg)
            
            all_trend_lines = {}
            failed_codes = []

            # 1. 실시간 등록 먼저 수행
            try:
                for i in range(0, total_codes, 100):
                    chunk_codes = all_codes[i:i+100]
                    screen_no = f"01{str(i//100).zfill(2)}"
                    codes_string = ";".join(chunk_codes)
                    
                    print(f"화면번호: {screen_no}")
                    print(f"종목 수: {len(chunk_codes)}")
                    
                    self.kiwoom_real.dynamicCall(
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

            # 2. 종목 분석 수행
            for code in all_codes:
                try:
                    result = await self.analyze_stock(code)
                    if result:
                        all_trend_lines.update(result)
                        print(f"종목 {code} 분석 성공")
                    else:
                        failed_codes.append(code)
                        print(f"종목 {code} 분석 실패")
                except Exception as e:
                    error_msg = f"종목 분석 실패: {code}\n에러 내용: {str(e)}"
                    await self.send_error_message("종목 분석 에러", error_msg)
                    failed_codes.append(code)

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
                current_price = self.kiwoom_real.GetCommRealData(code, 10)
                print(f"=== 실시간 데이터 수신 ===")
                print(f"종목코드: {code}")
                print(f"현재가: {current_price}")
                print("-" * 30)
        except Exception as e:
            print(f"실시간 데이터 처리 중 에러: {str(e)}")

    def Trade_Start(self):
        try:
            # QApplication 인스턴스 생성
            if not QApplication.instance():
                app = QApplication(sys.argv)
            
            # 1. 초기 분석 수행 및 실시간 등록
            async def run_surveillance():
                return await self.surveillance()
                
            result = asyncio.get_event_loop().run_until_complete(run_surveillance())
            print("\n=== 분석된 저항선/지지선 정보 ===")
            for code, data in result.items():
                
                trends = data.get('trends', [])
                parallels = data.get('parallels', [])
                
                print("추세선 상세:", trends)  # 추세선 데이터 상세 확인
                print("평행선 상세:", parallels)  # 평행선 데이터 상세 확인
                
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
                QApplication.processEvents()  # GUI 이벤트 처리
                time.sleep(0.1)  # CPU 사용률 감소
                
        except Exception as e:
            print(f"시스템 시작 실패: {str(e)}")
            import traceback
            traceback.print_exc()

    def _event_connect(self, err_code):
        """로그인 이벤트 처리"""
        if err_code == 0:
            print("실시간 서버 로그인 성공")
        else:
            print("실시간 서버 로그인 실패")
        self.login_event_loop.exit()


    

   
