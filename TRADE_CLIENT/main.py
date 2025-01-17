from gui import Program_Gui
from kiwoom_api import KiwoomAPI
from  Auth.Login import Auth
from PyQt5.QtWidgets import QApplication
import sys

def main():
    app = QApplication(sys.argv)
    Login = Auth()
    kiwoom = Login.Kiwoom_Login()
    Program = Program_Gui(kiwoom)
    if(kiwoom.GetConnectState()):
        Program.run()

    app.exec_()

if __name__ == "__main__":
    main()






























