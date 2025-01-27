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
        print(df)
        peaks = self.trading_technique.find_peaks(df)  # find_peaks 메서드 호출
        print(peaks)
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
    
    def plot_waves(self,df, peaks, waves):
        # 기존 그래프 위젯들 제거
        for widget in self.graph_frame.winfo_children():
            widget.destroy()

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
            """두 선이 비슷한지 확인하는 함수에 가격 차이 비교 로직 추가"""
            slope_similar = abs(slope1 - slope2) / (abs(slope1) + 1e-6) < tolerance
            
            # 가격 차이를 비율로 계산
            price_diff_ratio = abs(y1 - y2) / ((y1 + y2) / 2)
            price_similar = price_diff_ratio < 0.05  # 15% 이내의 가격 차이는 비슷한 것으로 간주
            
            return slope_similar or price_similar 
        
        existing_lines = []  # [(slope, y_value)] 리스트
        
        def draw_trendline_with_parallel(x1, y1, x2, y2, wave_low_x, wave_low_y):
            # 같은 x 좌표를 가진 점 처리
            if x2 - x1 == 0:
                return
                
            # 기울기 계산 (연간 변화율)
            slope = (y2 - y1) / (x2 - x1)
            y_mid = (y1 + y2) / 2

            # 비슷한 선이 있는지 확인
            for existing_slope, existing_y in existing_lines:
                if is_similar_line(slope, y_mid, existing_slope, existing_y, tolerance=0.5):
                    return

            existing_lines.append((slope, y_mid))
            
            # 추세선 그리기 (고점 연결)
            x_extended = np.array([x1, len(df)])
            y_extended = y1 + (y2 - y1) * (x_extended - x1) / (x2 - x1)
            ax.plot(x_extended, y_extended, color='green', linestyle='-', linewidth=2, alpha=0.5)
            
            # 평행선 그리기 (파동의 최저점 연결)
            x_parallel = np.array([wave_low_x, len(df)])
            y_parallel = wave_low_y + (y2 - y1) * (x_parallel - wave_low_x) / (x2 - x1)
            ax.plot(x_parallel, y_parallel, color='blue', linestyle='--', linewidth=2, alpha=0.5)
        
        # 최근 고점들만 사용
        recent_peaks = peaks[:]
        recent_waves = waves[:]
        
        for i in range(len(recent_peaks) - 1):
            current_peak = recent_peaks[i]
            next_peak = recent_peaks[i+1]
            
            # 같은 x 좌표를 가진 피크 처리
            if next_peak[0] - current_peak[0] == 0:
                continue
                
            # 현재 고점과 다음 고점 사이의 기울기 계산 - x축과 y축의 스케일을 맞춤
            x_range = df['High'].index.max() - df['High'].index.min()
            y_range = df['High'].max() - df['High'].min()
            
            # 스케일 조정된 기울기 계산
            dx = (next_peak[0] - current_peak[0]) / x_range * 100
            dy = (next_peak[1] - current_peak[1]) / y_range * 100
            slope = dy / dx * 100
        
            # 기울기가 140 이상인 경우
            if slope > 140:
                all_previous_peaks = recent_peaks[:i+1]
                highest_valid_peak = None
                highest_price = 0
                    
                # 과거 고점 중에서 가장 높은 가격을 찾고, 기울기가 140 이하인 경우
                for prev_peak in all_previous_peaks:
                    new_slope = (next_peak[1] - prev_peak[1]) / (next_peak[0] - prev_peak[0])
                        
                    if new_slope <= 140 and prev_peak[1] > highest_price:
                        # 선이 가격을 가로지르는지 확인
                        if not self.does_line_cross_price(df, prev_peak[0], prev_peak[1], 
                                                next_peak[0], next_peak[1]):
                            highest_price = prev_peak[1]
                            highest_valid_peak = prev_peak
                    
                    # 조건을 만족하는 과거 고점을 찾은 경우
                    if highest_valid_peak:
                        draw_trendline_with_parallel(highest_valid_peak[0], highest_valid_peak[1],
                                                    next_peak[0], next_peak[1],
                                                    recent_waves[i+1]['Wave_Low_Index'],
                                                    recent_waves[i+1]['Wave_Low'])
                    continue
                continue
            if slope < 0:
                future_peaks = recent_peaks[i+1:]
                next_peak = recent_peaks[i+1]  # 바로 다음 고점
                next_slope = (next_peak[1] - current_peak[1]) / (next_peak[0] - current_peak[0])
                
                # 모든 미래 고점들과의 기울기가 next_slope보다 작은지 확인
                all_slopes_smaller = True
                for future_peak in future_peaks:
                    new_slope = (future_peak[1] - current_peak[1]) / (future_peak[0] - current_peak[0])
                    if new_slope > next_slope:  # 하나라도 더 큰 기울기가 있다면
                        # 선이 가격을 가로지르는지 확인
                        if not self.does_line_cross_price(df, current_peak[0], current_peak[1], 
                                                future_peak[0], future_peak[1]):
                            all_slopes_smaller = False
                            break
                
                # 모든 기울기가 next_slope보다 작다면 선을 그리지 않음
                if all_slopes_smaller:
                    continue
                    
                valid_peak = None
                min_positive_slope = float('inf')
                min_negative_slope = float('-inf')
                positive_peak = None
                negative_peak = None
                
                for future_peak in future_peaks:
                    new_slope = (future_peak[1] - current_peak[1]) / (future_peak[0] - current_peak[0])
                    # 선이 가격을 가로지르지 않는 경우에만 고려
                    if not self.does_line_cross_price(df, current_peak[0], current_peak[1], 
                                            future_peak[0], future_peak[1]):
                        if 0 <= new_slope <= 140:
                            if new_slope < min_positive_slope:
                                min_positive_slope = new_slope
                                positive_peak = future_peak
                        elif new_slope > min_negative_slope:
                            min_negative_slope = new_slope
                            negative_peak = future_peak
                
                valid_peak = positive_peak if positive_peak else negative_peak
                
                if valid_peak:
                    valid_peak_idx = next(idx for idx, peak in enumerate(recent_peaks) if peak[0] == valid_peak[0])
                    draw_trendline_with_parallel(current_peak[0], current_peak[1],
                                            valid_peak[0], valid_peak[1],
                                            recent_waves[valid_peak_idx]['Wave_Low_Index'],
                                            recent_waves[valid_peak_idx]['Wave_Low'])
                continue
            
            # 그 외의 경우: 인접한 고점끼리 연결
            draw_trendline_with_parallel(current_peak[0], current_peak[1],
                                        next_peak[0], next_peak[1],
                                        recent_waves[i+1]['Wave_Low_Index'],
                                        recent_waves[i+1]['Wave_Low'])
   
    
        ax.set_title('Stock Price Waves Analysis')
        ax.grid(True, alpha=0.2)
        ax.legend()
        
        plt.tight_layout()
        
        try:
            # tkinter에 matplotlib 차트 내장
            canvas = FigureCanvasTkAgg(fig, master=self.graph_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=True)
            
            # 네비게이션 툴바 추가 (선택사항)
            from matplotlib.backends.backend_tkagg import NavigationToolbar2Tk
            toolbar = NavigationToolbar2Tk(canvas, self.graph_frame)
            toolbar.update()
            
        except Exception as e:
            print(f"Error creating chart: {e}")
        finally:
            # 메모리 관리를 위해 figure 정리
            plt.close(fig)



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
    def does_line_cross_price(self, df, x1, y1, x2, y2):
        """두 점을 잇는 선이 그 사이의 가격을 가로지르는지 확인"""
        if x1 >= x2 or x2 - x1 == 0:  # x 좌표가 같은 경우도 체크
            return True
        
        # 선의 방정식 계수
        slope = (y2 - y1) / (x2 - x1)
        intercept = y1 - slope * x1
        
        # 두 점 사이의 모든 가격 데이터 확인
        for x in range(x1 + 1, x2):
            line_y = slope * x + intercept  # 선 위의 y값
            price = df.iloc[x]['High']      # 해당 시점의 가격
            
            # 선이 가격을 가로지르는지 확인
            if line_y < price:
                return True
        
        return False


    def run(self):
        self.root.mainloop()


      

