import os
import tkinter as tk
from tkinter import ttk, messagebox
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from Api import Api
from Trade import Trade
from trading_technique import Trading_Technique
from kiwoom_api import KiwoomAPI
import sqlite3
from scipy.signal import argrelextrema
import asyncio

class Program_Gui:
    def __init__(self, kiwoom):
        self.root = self.create_login_window()
        self.Kiwoom_Auth = kiwoom
        self.Kiwoom_OpenAPI = KiwoomAPI(self.Kiwoom_Auth)
        self.setup_gui()
        self.trading_technique = Trading_Technique()
        self.trade = Trade(self.Kiwoom_Auth)
        self.api = Api(self.Kiwoom_Auth)

    def create_login_window(self):
        root = tk.Tk()
        root.title("주식 자동 매매")
        root.state('zoomed')
        return root

    def setup_gui(self):
        main_frame = ttk.Frame(self.root)
        main_frame.pack(expand=True, fill='both', padx=20, pady=20)

        input_frame = ttk.Frame(main_frame)
        input_frame.pack(pady=20)

        # 숫자만 입력할 수 있도록 validatecommand 설정
        validate_command = (self.root.register(self.validate_input), '%P')

        self.number_entry = ttk.Entry(input_frame, width=20, validate='key', validatecommand=validate_command)
        self.number_entry.grid(row=0, column=0, padx=5)
        self.number_entry.insert(0, "종목 코드를 입력하세요")
        self.number_entry.bind("<FocusIn>", self.clear_placeholder)
        self.number_entry.bind("<FocusOut>", self.set_placeholder)

        # 버튼을 입력 필드 바로 옆에 배치
        load_all_stocks_button = ttk.Button(
            input_frame, 
            text="종목 코드 검색", 
            command=self.load_all_stocks
        )
        load_all_stocks_button.grid(row=0, column=1, padx=10)
        # 버튼을 입력 필드 바로 옆에 배치
        
        load_all_stocks_code_button = ttk.Button(
            input_frame, 
            text="종목 실시간 감시", 
            command=lambda: self.trade.Trade_Start()
        )
        load_all_stocks_code_button.grid(row=0, column=2, padx=10)


        update_stock_date_button = ttk.Button(
            input_frame,
            text="종목 정보 업데이트", 
            command=lambda: asyncio.run(self.api.Stock_Data())
        )
        update_stock_date_button.grid(row=0, column=4, padx=10)

        # 그래프를 표시할 프레임 추가
        self.graph_frame = ttk.Frame(main_frame)
        self.graph_frame.pack(expand=True, fill='both', pady=20)

    def on_enter(self, event):
        # 엔터 키가 눌렸을 때 load_all_stocks 메서드 호출
        self.load_all_stocks()

    def load_all_stocks(self):
        stock_code = self.number_entry.get()
        print(f"입력된 종목 코드: {stock_code}")

        # API로 데이터 가져오기
        stock_data = self.Kiwoom_OpenAPI.get_stock_data(stock_code)
        
        # DataFrame을 리스트로 변환
        data_to_insert = stock_data.values.tolist()
        
        # 종목 코드별 DB 파일 생성
        db_name = f'stock_{stock_code}.db'
        if os.path.exists(db_name):
            os.remove(db_name)
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
        # OHLCV 데이터 구조에 맞게 테이블 생성
        cursor.execute('''CREATE TABLE IF NOT EXISTS stock_data
                         (Date REAL, Open REAL, High REAL, Low REAL, 
                          Close REAL, Volume REAL)''')
        
        # 새 데이터 삽입
        cursor.executemany("INSERT INTO stock_data VALUES (?,?,?,?,?,?)", 
                          data_to_insert)
        
        conn.commit()
        conn.close()
        
        # 데이터 로드 및 분석
        df = self.load_data(stock_code)
        peaks = self.trading_technique.find_peaks(df)  # find_peaks 메서드 호출
        waves = self.trading_technique.analyze_waves(df, peaks)  # analyze_waves 메서드 호출
        filtered_waves, filtered_peaks = self.trading_technique.filter_waves(waves, peaks)
        self.plot_waves(df, filtered_peaks,filtered_waves)

    def load_data(self, stock_code):
        db_name = f'stock_{stock_code}.db'
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM stock_data")
        data = cursor.fetchall()
        columns = ["Date", "Open", "High", "Low", "Close", "Volume"]
        df = pd.DataFrame(data, columns=columns)
        conn.close()
        return df
    
    def plot_waves(self, df, peaks, waves):
        for widget in self.graph_frame.winfo_children():
            widget.destroy()
            
        plt.clf()
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(15, 8))
        
        # 주가 그래프
        ax.plot(df['High'], color='white', alpha=0.7, label='Price')
        
        # 파동의 최저점 표시
        for wave in waves:
            ax.scatter(wave['Wave_Low_Index'], wave['Wave_Low'], 
                    color='yellow', marker='o', s=80)
        
        # 주요 고점 표시
        peak_indices = [p[0] for p in peaks]
        peak_prices = [p[1] for p in peaks]
        ax.scatter(peak_indices, peak_prices, color='red', marker='o', s=100, label='Peaks')
        max_price = max(df['High']) * 1.2
        ax.set_ylim(0, max_price)
        
        def is_similar_line(slope1, y1, slope2, y2, tolerance=0.05):
            """두 선이 비슷한지 확인 (기울기와 y값 모두 고려)"""
            slope_similar = abs(slope1 - slope2) / (abs(slope1) + 1e-6) < tolerance
            y_similar = abs(y1 - y2) / (abs(y1) + 1e-6) < tolerance
            return slope_similar and y_similar
        
        existing_lines = []  # [(slope, y_value)] 리스트
        
        def draw_trendline_with_parallel(x1, y1, x2, y2, wave_low_x, wave_low_y):
            # 추세선의 기울기와 y값 계산
            slope = (y2 - y1) / (x2 - x1)
            y_mid = (y1 + y2) / 2
            
            # 비슷한 선이 있는지 확인 (tolerance 값을 더 크게 설정)
            for existing_slope, existing_y in existing_lines:
                if is_similar_line(slope, y_mid, existing_slope, existing_y, tolerance=0.1):
                    return  # 비슷한 선이 있으면 그리지 않음
            
            # 새로운 선 추가 및 그리기
            existing_lines.append((slope, y_mid))
            x_extended = np.array([x1, len(df)])
            y_extended = slope * x_extended + (y1 - slope * x1)
            ax.plot(x_extended, y_extended, color='green', linestyle='-', linewidth=2, alpha=0.5)
        
            # 평행선 그리기
            parallel_intercept = wave_low_y - slope * wave_low_x
            x_parallel = np.array([wave_low_x, len(df)])
            y_parallel = slope * x_parallel + parallel_intercept
            ax.plot(x_parallel, y_parallel, color='blue', linestyle='--', linewidth=2, alpha=0.5)
        
        # 최근 고점들만 사용
        recent_peaks = peaks[-6:]
        recent_waves = waves[-6:]
        
        for i in range(len(recent_peaks) - 1):
            current_peak = recent_peaks[i]
            next_peak = recent_peaks[i+1]
            
            # 다음 고점이 현재 고점보다 높을 때만 가격 차이 계산
            if next_peak[1] > current_peak[1]:
            
                price_diff_percent = (next_peak[1] - current_peak[1]) / current_peak[1] * 100
                print(price_diff_percent)
                
                if price_diff_percent >= 25:
                    # 40% 이상 높을 경우: 다음 고점과 가장장 가까운 과거 고점 찾기
                    all_previous_peaks = recent_peaks[:i+1]
                    closest_peak = None
                    min_diff = float('inf')
                    
                    # 가장 가까운 가격의 고점 찾기
                    for prev_peak in all_previous_peaks:
                        diff = abs(prev_peak[1] - next_peak[1])
                        print(prev_peak[1], next_peak[1])
                        print(diff)
                        if diff < min_diff:
                            min_diff = diff
                            closest_peak = prev_peak
                    
                    if closest_peak:
                        draw_trendline_with_parallel(closest_peak[0], closest_peak[1],
                                                next_peak[0], next_peak[1],
                                                recent_waves[i+1]['Wave_Low_Index'],
                                                recent_waves[i+1]['Wave_Low'])
                    continue  # 다음 반복으로 넘어감
            
            # 그 외의 경우: 인접한 고점끼리 연결
            draw_trendline_with_parallel(current_peak[0], current_peak[1],
                                    next_peak[0], next_peak[1],
                                    recent_waves[i+1]['Wave_Low_Index'],
                                    recent_waves[i+1]['Wave_Low'])
    
        ax.set_title('Stock Price Waves Analysis')
        ax.grid(True, alpha=0.2)
        ax.legend()
        
        plt.tight_layout()
    
            
            # tkinter에 matplotlib 차트 내장
        canvas = FigureCanvasTkAgg(fig, master=self.graph_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=True)
            
            # matplotlib 창이 별도로 열리지 않도록 plt.show() 제거
        plt.close(fig)


    # def plot_waves(self, df, peaks, waves):
    #     # 기존 그래프 프레임의 위젯들을 제거
    #     for widget in self.graph_frame.winfo_children():
    #         widget.destroy()

    #     plt.style.use('dark_background')
    #     fig, ax = plt.subplots(figsize=(15, 8))
        
    #     # x축 눈금과 라벨 제거
    #     ax.set_xticks([])
    #     ax.set_xticklabels([])
        
    #     # 주가 그래프
    #     ax.plot(df['High'], color='white', alpha=0.7, label='Price')
        
    #     # 파동의 최저점 표시
    #     for wave in waves:
    #         ax.scatter(wave['Wave_Low_Index'], wave['Wave_Low'], 
    #                 color='yellow', marker='o', s=80)
        
    #     # 주요 고점 표시
    #     peak_indices = [p[0] for p in peaks]
    #     peak_prices = [p[1] for p in peaks]
    #     ax.scatter(peak_indices, peak_prices, color='red', marker='o', s=100, label='Peaks')
        
    #     def is_similar_line(slope1, y1, slope2, y2, tolerance=0.05):
    #         """두 선이 비슷한지 확인 (기울기와 y값 모두 고려)"""
    #         slope_similar = abs(slope1 - slope2) / (abs(slope1) + 1e-6) < tolerance
    #         y_similar = abs(y1 - y2) / (abs(y1) + 1e-6) < tolerance
    #         return slope_similar and y_similar
        
    #     existing_lines = []  # [(slope, y_value)] 리스트
        
    #     def draw_trendline_with_parallel(x1, y1, x2, y2, wave_low_x, wave_low_y):
    #         # 추세선의 기울기와 y값 계산
    #         slope = (y2 - y1) / (x2 - x1)
    #         y_mid = (y1 + y2) / 2
            
    #         # 비슷한 선이 있는지 확인 (tolerance 값을 더 크게 설정)
    #         for existing_slope, existing_y in existing_lines:
    #             if is_similar_line(slope, y_mid, existing_slope, existing_y, tolerance=0.1):
    #                 return  # 비슷한 선이 있으면 그리지 않음
            
    #         # 새로운 선 추가 및 그리기
    #         existing_lines.append((slope, y_mid))
    #         x_extended = np.array([x1, len(df)])
    #         y_extended = slope * x_extended + (y1 - slope * x1)
    #         ax.plot(x_extended, y_extended, color='green', linestyle='-', linewidth=2, alpha=0.5)
            
    #         # 평행선 그리기
    #         parallel_intercept = wave_low_y - slope * wave_low_x
    #         x_parallel = np.array([wave_low_x, len(df)])
    #         y_parallel = slope * x_parallel + parallel_intercept
    #         ax.plot(x_parallel, y_parallel, color='blue', linestyle='--', linewidth=2, alpha=0.5)
        
    #     # 최근 고점들만 사용
    #     recent_peaks = peaks[-6:]
    #     recent_waves = waves[-6:]
        
    #     for i in range(len(recent_peaks) - 1):
    #         current_peak = recent_peaks[i]
    #         next_peak = recent_peaks[i+1]
            
    #         # 다음 고점이 현재 고점보다 높을 때만 가격 차이 계산
    #         if next_peak[1] > current_peak[1]:
    #             price_diff_percent = (next_peak[1] - current_peak[1]) / current_peak[1] * 100
                
    #             if price_diff_percent >= 50:
    #                 # 40% 이상 높을 경우: 다음 고점과 가장 가까운 과거 고점 찾기
    #                 all_previous_peaks = recent_peaks[:i+1]
    #                 closest_peak = None
    #                 min_diff = float('inf')
                    
    #                 # 가장 가까운 가격의 고점 찾기
    #                 for prev_peak in all_previous_peaks:
    #                     diff = abs(prev_peak[1] - next_peak[1])
    #                     if diff < min_diff:
    #                         min_diff = diff
    #                         closest_peak = prev_peak
                    
    #                 if closest_peak:
    #                     draw_trendline_with_parallel(closest_peak[0], closest_peak[1],
    #                                             next_peak[0], next_peak[1],
    #                                             recent_waves[i+1]['Wave_Low_Index'],
    #                                             recent_waves[i+1]['Wave_Low'])
    #                 continue  # 다음 반복으로 넘어감
            
    #         # 그 외의 경우: 인접한 고점끼리 연결
    #         draw_trendline_with_parallel(current_peak[0], current_peak[1],
    #                                 next_peak[0], next_peak[1],
    #                                 recent_waves[i+1]['Wave_Low_Index'],
    #                                 recent_waves[i+1]['Wave_Low'])
    
    #     ax.set_title('Stock Price Waves Analysis')
    #     ax.grid(True, alpha=0.2)
    #     ax.legend()
        
    #     plt.tight_layout()
        
    #     # tkinter에 matplotlib 차트 내장
    #     canvas = FigureCanvasTkAgg(fig, master=self.graph_frame)
    #     canvas.draw()
    #     canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=True)
        
    #     # matplotlib 창이 별도로 열리지 않도록 plt.show() 제거
    #     plt.close(fig)


    def clear_placeholder(self, event):
        if self.number_entry.get() == "종목 코드를 입력하세요":
            self.number_entry.delete(0, tk.END)  # 입력 필드 비우기

    def set_placeholder(self, event):
        if not self.number_entry.get():  # 입력 필드가 비어있으면
            self.number_entry.insert(0, "종목 코드를 입력하세요")  # 기본 텍스트 다시 삽입

    def validate_input(self, new_value):
        # 입력된 값이 숫자이거나 비어있을 경우 True 반환
        if new_value == "" or new_value.isdigit():
            return True
        return False

    def run(self):
        self.root.mainloop()


      

