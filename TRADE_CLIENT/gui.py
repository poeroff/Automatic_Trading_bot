import tkinter as tk
from kiwoom_api import KiwoomAPI
import socket
import pandas as pd
import json
import pickle
import numpy as np
from scipy.signal import find_peaks

class Program_Gui:
    def __init__(self):
        self.Kiwoom_OpenAPI = KiwoomAPI()

    def create_login_window():
        root = tk.Tk()
        root.title("주식 자동 매매")
        root.state('zoomed')
        return root

    def on_login(self,kiwoom):

        print("로그인 성공")
        # 여기에 로그인 성공 후 추가 작업을 수행할 수 있습니다.

        data = self.Kiwoom_OpenAPI.get_stock_data(kiwoom)
        print(data)
        # 고점 탐지
        # 고점 탐지 
        peaks, _ = find_peaks(data["Close"].values, distance=1, prominence=100)

        # 데이터프레임을 numpy 배열로 변환하여 작업
        labels = np.zeros(len(data))
        labels[peaks] = 1

        # 레이블 배열을 데이터프레임에 추가
        data = data.to_frame() if isinstance(data, pd.Series) else data
        data['label'] = labels

        print(data)

        # data['label'] = 0
        # for peak in peaks:
        #     data.loc[data.index[peak], 'label'] = 1

        # print(data)
        # with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        #     s.connect(('127.0.0.1', 65432))
                
        #         # DataFrame을 pickle로 직렬화
        #     data = pickle.dumps(data)
                
        #         # 데이터 크기를 먼저 전송 (4바이트 정수)
        #     s.sendall(len(data).to_bytes(4, byteorder='big'))
                
        #         # 실제 데이터 전송
        #     s.sendall(data)
        #     print("DataFrame을 서버로 전송했습니다.")
      

