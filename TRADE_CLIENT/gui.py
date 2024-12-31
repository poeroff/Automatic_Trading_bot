import tkinter as tk
from kiwoom_api import LoginKiwoom
import socket
import json
import pickle

def create_login_window():
    root = tk.Tk()
    root.title("키움 주식 자동 매매")
    root.geometry("1000x1000")
    login_button = tk.Button(root, text="로그인", command=lambda: on_login(login_button))
    login_button.pack()
    return root

def on_login(button):
    if LoginKiwoom.login_kiwoom():
        print("로그인 성공")
        button.pack_forget()  # 로그인 버튼 제거
        # 여기에 로그인 성공 후 추가 작업을 수행할 수 있습니다.
        data = LoginKiwoom.get_stock_data()
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(('127.0.0.1', 65432))
            
            # DataFrame을 pickle로 직렬화
            data = pickle.dumps(data)
            
            # 데이터 크기를 먼저 전송 (4바이트 정수)
            s.sendall(len(data).to_bytes(4, byteorder='big'))
            
            # 실제 데이터 전송
            s.sendall(data)
            print("DataFrame을 서버로 전송했습니다.")
      
    else:
        print("로그인 실패")
