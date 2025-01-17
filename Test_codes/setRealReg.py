from PyQt5.QAxContainer import *
from PyQt5.QtCore import *
import sys
from PyQt5.QtWidgets import *
import time

class KiwoomReal(QAxWidget):
    def __init__(self):
        super().__init__()
        self._create_kiwoom_instance()
        self._set_signal_slots()
        self.fids = ["10"]  # 현재가

    def _create_kiwoom_instance(self):
        self.setControl("KHOPENAPI.KHOpenAPICtrl.1")

    def _set_signal_slots(self):
        self.OnEventConnect.connect(self._event_connect)
        self.OnReceiveRealData.connect(self._receive_real_data)

    def comm_connect(self):
        self.dynamicCall("CommConnect()")
        self.login_event_loop = QEventLoop()
        self.login_event_loop.exec_()

    def _event_connect(self, err_code):
        if err_code == 0:
            print("로그인 성공")
        else:
            print("로그인 실패")
        self.login_event_loop.exit()

    def _receive_real_data(self, code, real_type, real_data):
        if real_type == "주식체결":
            current_price = self.GetCommRealData(code, 10)  # 현재가
            print(f"종목코드: {code}")
            print(f"현재가: {current_price}")

    def set_real_reg(self, screen_no, code_list, fid_list, real_type):
        self.dynamicCall("SetRealReg(QString, QString, QString, QString)", 
                        screen_no, code_list, fid_list, real_type)
        print(f"실시간 등록 완료: {code_list}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    kiwoom = KiwoomReal()
    
    # 로그인
    kiwoom.comm_connect()
    
    # 삼성전자(005930)와 현대차(005380) 실시간 시세 등록
    codes = "005930;005380"
    kiwoom.set_real_reg("1000", codes, ";".join(kiwoom.fids), "0")
    
    # 프로그램 종료 방지
    while True:
        app.processEvents()
        time.sleep(1)
