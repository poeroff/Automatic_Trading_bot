from pykiwoom.kiwoom import Kiwoom

class Auth:
    def __init__(self):
        self.kiwoom = None  # Kiwoom 객체를 클래스 인스턴스 변수로 초기화

    def Kiwoom_Login(self):
        self.kiwoom = Kiwoom()  # Kiwoom 객체 생성
        self.kiwoom.CommConnect(block=True)  # 로그인 수행
        return self.kiwoom