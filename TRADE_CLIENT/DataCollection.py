import asyncio
from datetime import datetime, timedelta
import time
import schedule

import pandas as pd
from Api import Api
from gui import Program_Gui
from kiwoom_api import KiwoomAPI
from  Auth.Login import Auth
from PyQt5.QtWidgets import QApplication
import sys

def main():
    app = QApplication(sys.argv)
    Login = Auth()
    kiwoom = Login.Kiwoom_Login()
    api = Api(kiwoom)
    asyncio.run(api.Stock_Data())
    app.exec_()


if __name__ == "__main__":
    main()
