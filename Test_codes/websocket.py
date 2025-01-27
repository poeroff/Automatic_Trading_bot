import asyncio
import time
import websockets
from pykiwoom.kiwoom import *
from PyQt5.QAxContainer import QAxWidget
from PyQt5.QtWidgets import QApplication
from PyQt5.QtCore import QEventLoop, QTimer
import sys
import json

class KiwoomHandler:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.kiwoom_api = QAxWidget("KHOPENAPI.KHOpenAPICtrl.1")
        self.login_event_loop = None
        self.tr_event_loop = None
        self.received_data = False
        self.tr_data = {}

        # 이벤트 연결
        self.kiwoom_api.OnEventConnect.connect(self.event_connect)
        self.kiwoom_api.OnReceiveTrData.connect(self.receive_tr_data)

    def login(self):
        self.kiwoom_api.dynamicCall("CommConnect()")
        self.login_event_loop = QEventLoop()
        self.login_event_loop.exec_()

    def event_connect(self, err_code):
        if err_code == 0:
            print("로그인 성공")
            # 사용자 정보 출력
            account_num = self.kiwoom_api.dynamicCall("GetLoginInfo(QString)", "ACCOUNT_CNT")
            accounts = self.kiwoom_api.dynamicCall("GetLoginInfo(QString)", "ACCNO").split(';')
            user_id = self.kiwoom_api.dynamicCall("GetLoginInfo(QString)", "USER_ID")
            user_name = self.kiwoom_api.dynamicCall("GetLoginInfo(QString)", "USER_NAME")
            
            print(f"계좌 개수: {account_num}")
            print(f"계좌번호: {accounts}")
            print(f"사용자 ID: {user_id}")
            print(f"사용자 이름: {user_name}")
        else:
            print(f"로그인 실패. 에러 코드: {err_code}")
        self.login_event_loop.exit()

    def get_market_info(self):
        self.received_data = False
        self.tr_data = {}

        # 코스피 정보 요청
        self.request_market_data("001", "Kospi")
        
        # 코스닥 정보 요청
        self.request_market_data("101", "Kosdaq")

        return self.tr_data

    def request_market_data(self, market_code, market_name):
        self.kiwoom_api.dynamicCall("SetInputValue(QString, QString)", "업종코드", market_code)
        self.kiwoom_api.dynamicCall("SetInputValue(QString, QString)", "기준일자", "20250127")

        result = self.kiwoom_api.dynamicCall("CommRqData(QString, QString, int, QString)", f"{market_name}일봉조회", "opt20006", 0, "0101")
       
        if result != 0:
            print(f"{market_name} TR 요청 실패: {result}")
            return

        self.tr_event_loop = QEventLoop()
        self.tr_event_loop.exec_()

    def receive_tr_data(self, screen_no, rqname, trcode, record_name, next, unused1, unused2, unused3, unused4):
        if "일봉조회" in rqname:
            market_name = rqname.replace("일봉조회", "")
            current_price = self.kiwoom_api.dynamicCall("GetCommData(QString, QString, int, QString)", str(trcode), str(rqname), int(0), str("현재가"))
            day_before_change = self.kiwoom_api.dynamicCall("GetCommData(QString, QString, int, QString)", str(trcode), str(rqname), int(0), str("전일대비"))
            
            self.tr_data[market_name] = {
                "current_price": current_price.strip() if current_price is not None else "0",
                "day_before_change": day_before_change.strip() if day_before_change is not None else "0",
            }

            
            self.tr_event_loop.exit()



async def handle_client(websocket, path, kiwoom_handler):
    try:
        print("새로운 클라이언트 연결됨")
        while True:
            message = await websocket.recv()
            print(f"클라이언트로부터 받은 메시지: {message}")

            if message == "market_info":
                print("시장 정보 요청 받음")
                market_info = kiwoom_handler.get_market_info()
                await websocket.send(json.dumps(market_info))
                print("시장 정보 전송 완료")

    except websockets.exceptions.ConnectionClosed:
        print("클라이언트 연결 종료")
    except Exception as e:
        print(f"에러 발생: {str(e)}")
    finally:
        print("연결 종료")

async def main():
    kiwoom_handler = KiwoomHandler()
    kiwoom_handler.login()

    server = await websockets.serve(lambda ws, path: handle_client(ws, path, kiwoom_handler),"localhost", 8765)
    print("웹소켓 서버 시작")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
