import sys
from PyQt5.QAxContainer import *
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from pykiwoom.kiwoom import *

class StockSystem:
    def __init__(self):
        # pykiwoom을 사용하여 로그인
        self.kiwoom = Kiwoom()
        self.kiwoom.CommConnect(block=True)
        
        if self.kiwoom.GetConnectState() == 1:
            print('로그인 성공!')
        else:
            print('로그인 실패!')
            return
        
        # PyQt5 QAxWidget을 사용하여 TR 요청
        self.kiwoom_api = QAxWidget("KHOPENAPI.KHOpenAPICtrl.1")
        self.kiwoom_api.OnReceiveTrData.connect(self.trdata_get)

    def request_opt10001(self, stock_code):
        print(f"{stock_code} 종목의 현재가를 요청합니다.")
        
        # TR 요청
        self.kiwoom_api.dynamicCall("SetInputValue(QString, QString)", "종목코드", stock_code)
        self.kiwoom_api.dynamicCall("CommRqData(QString, QString, int, QString)", "opt_10001", "opt10001", 0, "0303")
        
        # 이벤트 루프 대기
        self.tr_event_loop = QEventLoop()
        self.tr_event_loop.exec_()

    def trdata_get(self, sScrNo, sRQName, sTrCode, sRecordName, sPrevNext):
        if sRQName == "opt_10001":
            종목코드 = self.kiwoom_api.dynamicCall("GetCommData(QString, QString, int, QString)", sTrCode, sRQName, 0, "종목코드").strip()
            현재가 = self.kiwoom_api.dynamicCall("GetCommData(QString, QString, int, QString)", sTrCode, sRQName, 0, "현재가").strip()
            종목명 = self.kiwoom_api.dynamicCall("GetCommData(QString, QString, int, QString)", sTrCode, sRQName, 0, "종목명").strip()
            
            print(f"\n=== 주식기본정보 ===")
            print(f"종목코드: {종목코드}")
            print(f"종목명: {종목명}")
            print(f"현재가: {abs(int(현재가)):,}원")
            print("=" * 20)
            
            self.tr_event_loop.exit()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    system = StockSystem()
    
    # 삼성전자(005930) 조회
    system.request_opt10001("005930")
    
    # SK하이닉스(000660) 조회
    system.request_opt10001("000660")
    
    app.exec_()
