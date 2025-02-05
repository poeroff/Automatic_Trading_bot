import re
import sys
import time
from PyQt5.QAxContainer import QAxWidget
from PyQt5.QtWidgets import QApplication
from PyQt5.QtCore import QEventLoop
import requests

class KiwoomEventHandler:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.kiwoom = QAxWidget("KHOPENAPI.KHOpenAPICtrl.1")
        
        # 이벤트 연결
        self.kiwoom.OnEventConnect.connect(self._event_connect)
        self.kiwoom.OnReceiveConditionVer.connect(self._receive_condition_ver)
        
        self.kiwoom.OnReceiveTrData.connect(self.trdata_get)
        self.stock_name = None
        self.current_price = None
        self.tr_event_loop = None

        # 이벤트 루프 초기화
        self.login_event_loop = None
        self.condition_loop = None
        
        # 로그인
        self.connect_kiwoom()
        
    def connect_kiwoom(self):
        self.login_event_loop = QEventLoop()
        self.kiwoom.CommConnect()
        self.login_event_loop.exec_()
    
    def _event_connect(self, err_code):
        if err_code == 0:
            print("로그인 성공")
        else:
            print(f"로그인 실패. 에러 코드: {err_code}")
        
        if self.login_event_loop is not None:
            self.login_event_loop.exit()
    
    def _receive_condition_ver(self, ret, msg):
        if self.condition_loop is not None:
            self.condition_loop.exit()
    
    def All_Stock_Data(self):
        try:
            # 코스피 종목 코드 가져오기
            kospi = self.kiwoom.dynamicCall("GetCodeListByMarket(QString)", "0")
            kospi_codes = kospi.split(';')
            
            # 코스닥 종목 코드 가져오기
            kosdaq = self.kiwoom.dynamicCall("GetCodeListByMarket(QString)", "10")
            kosdaq_codes = kosdaq.split(';')
            
            # 숫자로만 구성된 코드만 필터링
            kospi_codes = [code for code in kospi_codes if code.isdigit()]
            kosdaq_codes = [code for code in kosdaq_codes if code.isdigit()]
            
            all_codes = kospi_codes + kosdaq_codes
            stock_codes = {}  # 종목코드와 종목명을 저장할 딕셔너리
            
            print(f"전체 종목 수: {len(all_codes)}")
            
            exclude_keywords = [
                'ETF', 'ETN', '선물', 
                'KODEX', 'TIGER', 'KBSTAR',
                'SOL', 'ACE', "VITA",
                'HANARO', 'KOSEF', 'KINDEX', 
                'ARIRANG', 'SMART', 'FOCUS',
                'TIMEFOLIO', 'WOORI',
                '우B', '우C', 
                '레버리지', '인버스',
                'KoAct', '채권', "스팩", "PLUS",
                "RISE", "KIWOOM", "BNK", "WON",
                "마이다스", "에셋플러스", "KCGI", "리츠", "액티브"
            ]
            
            for code in all_codes:
                if not code:  # 빈 코드 건너뛰기
                    continue
                    
                # GetMasterCodeName 호출 시 dynamicCall 사용
                stock_name = self.kiwoom.dynamicCall("GetMasterCodeName(QString)", code)
                is_suspended = self.is_stock_suspended(code)
                
                if is_suspended == False:
                    if not any(keyword in stock_name for keyword in exclude_keywords) and not re.search(r'\d', stock_name):
                        stock_codes[code] = stock_name
                    
            print(f"필터링 후 종목 수: {len(stock_codes)}")
            return stock_codes
            
        except Exception as e:
            print(f"종목 데이터 수집 중 오류 발생: {str(e)}")
            return {}
    def rq_data_opt10001(self, stock_code):
        self.kiwoom.dynamicCall("SetInputValue(QString, QString)", "종목코드", stock_code)
        self.kiwoom.dynamicCall("CommRqData(QString, QString, int, QString)", 
                               "opt_10001", "opt10001", 0, "0303")
        
        self.tr_event_loop = QEventLoop()
        self.tr_event_loop.exec_()
        
        return self.stock_name, self.current_price
    def trdata_get(self, sScrNo, rqname, strcode, sRecordName, sPreNext, 
                  nDataLength, sErrorCode, sMessage, sSplmMsg):
        if rqname == "opt_10001":
            self.current_price = abs(int(self.kiwoom.dynamicCall(
                "GetCommData(QString, QString, int, QString)", 
                "opt10001", "주식기본정보요청", 0, "현재가")))
            self.stock_name = self.kiwoom.dynamicCall(
                "GetCommData(QString, QString, int, QString)", 
                "opt10001", "주식기본정보요청", 0, "종목명").strip()
            
            time.sleep(3.6)
            
            if self.tr_event_loop is not None:
                self.tr_event_loop.exit()

    def is_stock_suspended(self, stock_code):
        try:
            state = self.kiwoom.dynamicCall("GetMasterStockState(QString)", stock_code)
            suspension_keywords = ["거래정지", "감리종목", "관리종목"]
            for keyword in suspension_keywords:
                if keyword in state:
                    return True
            return False
            
        except Exception as e:
            print(f"거래정지 상태 확인 중 오류 발생: {str(e)}")
            return False

def main():
    handler = KiwoomEventHandler()
    # 종목 데이터 가져오기
    tr_codes = handler.All_Stock_Data()

    stock_data_list = []
    tr_codes_list = list(tr_codes.keys())
    for code in tr_codes_list:
            try:
                stock_name, current_price = handler.rq_data_opt10001(code)
                
                if current_price and current_price > 1200:
                    print(f"종목 코드: {code}, 종목명: {stock_name}, 현재가: {current_price}")
                    stock_data_list.append({'code': code, 'name': stock_name})
                    
            except Exception as e:
                print(f"오류 발생 - 종목 코드 {code}: {str(e)}")
                continue
        
       
    if stock_data_list:
        try:
            response = requests.post(
                "http://localhost:8000/tr_code_collection/",
                json={'tr_codes': stock_data_list}
            )
            print(f"서버 응답: {response.json()}")
        except Exception as e:
            print(f"서버 통신 오류: {str(e)}")


    
    
    # GUI 이벤트 루프 실행
    handler.app.exec_()

if __name__ == "__main__":
    main()