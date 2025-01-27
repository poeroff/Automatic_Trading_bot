import sqlite3
from datetime import timedelta
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd

def load_data():
    conn = sqlite3.connect('stock_012330.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stock_data")
    data = cursor.fetchall()
    columns = ["Date", "Open", "High", "Low", "Close", "Volume"]
    df = pd.DataFrame(data, columns=columns)
    conn.close()
    return df


def find_peaks(dataframe, high_column='High', compare_window=23, threshold=0.2):
    # 데이터의 단위 확인 (1일 vs 1분)
    first_date = int(float(dataframe['Date'].iloc[0]))
    second_date = int(float(dataframe['Date'].iloc[1]))
    
    # YYYYMMDD 형식으로 저장된 날짜를 datetime으로 변환
    first_date = pd.to_datetime(str(first_date), format='%Y%m%d')
    second_date = pd.to_datetime(str(second_date), format='%Y%m%d')

    time_diff = second_date - first_date

    
    # 시간 차이가 1일이면 186, 7일이면 124
    min_gap = 124 if time_diff.days >= 7 else 186
    
    peaks = []
    prices = dataframe[high_column].values
    last_peak_idx = -min_gap
    last_peak_price = 0
    
    for i in range(compare_window, len(dataframe)):
        window_before = prices[max(0, i-compare_window):i]
        window_after = prices[i+1:min(len(prices), i+compare_window+1)]
        current_price = prices[i]
   
        if (
            current_price > np.max(window_before) and 
            (len(window_after) == 0 or current_price > np.max(window_after))):
            
            future_min = np.min(prices[i:]) if i < len(prices)-1 else current_price
            drop_ratio = (current_price - future_min) / current_price
            
            if drop_ratio >= threshold:
                if peaks and (i - last_peak_idx < min_gap):
                    if current_price > last_peak_price:
                        peaks.pop()
                        peaks.append((i, current_price))
                        last_peak_idx = i
                        last_peak_price = current_price
                else:
                    peaks.append((i, current_price))
                    last_peak_idx = i
                    last_peak_price = current_price
    
    return peaks

def get_resistance_price(peaks, n, current_idx):
    if n == len(peaks) - 1:
        current_peak = peaks[n-1]  # 이전 고점
        next_peak = peaks[n]      # 현재(마지막) 고점
    else:
        current_peak = peaks[n]    # 현재 고점
        next_peak = peaks[n + 1]   # 다음 고점
    
    # 같은 x 좌표를 가진 피크 처리
    if next_peak[0] - current_peak[0] == 0:
        return 0
        
    # 기울기 계산
    slope = (next_peak[1] - current_peak[1]) / (next_peak[0] - current_peak[0])
    
    # y절편 계산
    intercept = current_peak[1] - slope * current_peak[0]
    
    # 현재 x좌표에서의 저항선 가격 계산
    resistance_price = slope * current_idx + intercept
    
    return resistance_price

def analyze_waves( dataframe, peaks):
        waves = []
        prices = dataframe['Close'].values
        # 날짜를 datetime 객체로 변환
        dates = pd.to_datetime(dataframe['Date'], format='%Y%m%d').values



        for i in range(len(peaks)):
            
            peak_idx = peaks[i][0]
            next_idx = len(dataframe) if i == len(peaks) - 1 else peaks[i + 1][0]
            
            
            wave_section = dataframe['Low'].iloc[peak_idx:next_idx]
            current_min = float('inf')
            min_idx = peak_idx
            max_rebound = 0  # 최대 반등 비율
            best_wave = None  # 최적의 파동 정보 저장


            # 고점 날짜를 pandas.Timestamp로 변환
            peak_date = pd.Timestamp(dates[peak_idx])
            
            for j in range(1, len(wave_section) - 1):
                current_idx = wave_section.index[j]
                current_price = wave_section.iloc[j]
                current_date = pd.Timestamp(dates[current_idx])  # 현재 날짜를 pandas.Timestamp로 변환

                # 1년 이내 조건 확인
                if current_date > peak_date + timedelta(days=365):
                    break  # 1년이 넘으면 더 이상 검사하지 않음
           
              
                resistance_price = get_resistance_price(peaks, i, current_idx)

                if current_price < current_min:
                    current_min = current_price
                    min_idx = wave_section.index[j]
                    continue  # 새로운 최저점을 찾았으므로 다음 반복으로
                

                # 현재 가격의 반등 비율 계산
                rebound_ratio = (current_price - current_min) / current_min
              
                # 10~17% 사이의 반등이고, 지금까지 찾은 것보다 더 큰 반등이면 저장
                if rebound_ratio > max_rebound:

                    # 저항선 가격 계산
                    resistance_price = get_resistance_price(peaks, i, min_idx)  # 최저점에서의 저항선 가격

                    # 최저점이 저항선보다 낮고
                    if current_min < resistance_price:  # 최저점이 저항선보다 낮은지 먼저 확인
                            max_rebound = rebound_ratio
                            best_wave = {
                                'Wave_Number': i + 1,
                                'Start_Index': peak_idx,
                                'End_Index': next_idx,
                                'Start_Price': peaks[i][1],
                                'End_Price': peaks[i + 1][1] if i < len(peaks) - 1 else prices[-1],
                                'Wave_Low': current_min,
                                'Wave_Low_Index': min_idx,
                                'Wave_High': max(wave_section),
                                'Wave_Length': next_idx - peak_idx,
                                'Rebound_Ratio': rebound_ratio * 100  # 백분율로 변환
                            }

            # 10~17% 사이의 반등을 찾은 경우
            if best_wave:
                waves.append(best_wave)
            else:
                waves.append({
                        'Wave_Number': i + 1,
                        'Start_Index': peak_idx,
                        'End_Index': next_idx,
                        'Start_Price': peaks[i][1],
                        'End_Price': peaks[i + 1][1] if i < len(peaks) - 1 else prices[-1],
                        'Wave_Low': min(wave_section),
                        'Wave_Low_Index': wave_section.idxmin(),
                        'Wave_High': max(wave_section),
                        'Wave_Length': next_idx - peak_idx,
                        'Rebound_Ratio': 0  # 조건에 맞는 반등 없음
                    })
 

        return waves


def filter_waves(waves, peaks):
    filtered_waves = []
    filtered_peaks = []
    i = 0
    
    while i < len(waves)-1:
        if(waves[i]['Wave_Low'] < waves[i+1]['Wave_Low'] and peaks[i][1] > peaks[i+1][1]):
            filtered_waves.append(waves[i])
            filtered_peaks.append(peaks[i])
            i += 2  # i+1을 건너뛰고 그 다음 데이터로 이동
        else:
            filtered_waves.append(waves[i])
            filtered_peaks.append(peaks[i])
            i += 1
    
    # 마지막 데이터가 처리되지 않았다면 추가
    if i < len(waves):
        filtered_waves.append(waves[-1])
        filtered_peaks.append(peaks[-1])
    
    return filtered_waves, filtered_peaks




def plot_waves(df, peaks, waves):
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
    
    
    def draw_trendline_with_parallel(x1, y1, x2, y2, wave_low_x, wave_low_y):
        # 같은 x 좌표를 가진 점 처리
        if x2 - x1 == 0:
            return

        # 현재 고점(x2, y2)을 지나는 모든 가능한 추세선들 찾기
        valid_connections = []
        for prev_peak in peaks:
            if prev_peak[0] >= x2:
                continue
                
            prev_slope = (y2 - prev_peak[1]) / (x2 - prev_peak[0])
        
            if -30 <= prev_slope <= 160 and not does_line_cross_price(df, prev_peak[0], prev_peak[1], x2, y2):
                valid_connections.append(prev_peak)
     

        if valid_connections:
            # 시간순으로 정렬
            valid_connections.sort(key=lambda x: x[0])
            # 가장 오래된 고점과 가장 최근 고점만 선택
            oldest_peak = valid_connections[0]
            # newest_peak = valid_connections[-1]
      
        
            
            # 가장 오래된 고점과의 추세선
            x_extended = np.array([oldest_peak[0], len(df)])
            y_extended = oldest_peak[1] + (y2 - oldest_peak[1]) * (x_extended - oldest_peak[0]) / (x2 - oldest_peak[0])
            ax.plot(x_extended, y_extended, color='green', linestyle='-', linewidth=2, alpha=0.5)
            print("추세선이 연결하는 두 점:")
            print("시작점: ({}, {})".format(oldest_peak[0], oldest_peak[1]))
            print("끝점: ({}, {})".format(x2, y2))


            # # 가장 최근 고점과의 추세선 (오래된 것과 다른 경우에만)
            # if newest_peak != oldest_peak:
            #     x_extended = np.array([newest_peak[0], len(df)])
            #     y_extended = newest_peak[1] + (y2 - newest_peak[1]) * (x_extended - newest_peak[0]) / (x2 - newest_peak[0])
            #     ax.plot(x_extended, y_extended, color='green', linestyle='-', linewidth=2, alpha=0.5)

            # 평행선 그리기 (n+1번째 고점의 파동에 대해서만)
            if(oldest_peak[0] == x1):
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
        dx = (next_peak[0] - current_peak[0]) / x_range * 100  # x 변화량을 100 기준으로 정규화
        dy = (next_peak[1] - current_peak[1]) / y_range * 100  # y 변화량을 100 기준으로 정규화
        slope = dy / dx * 100  # 실제 각도에 가까운 기울기
        print("slope:",slope)
    

        # 기울기가 160 이상인 경우는 그대로 유지
        if slope > 160:
            all_previous_peaks = recent_peaks[:i+1]
            highest_valid_peak = None
            highest_price = 0
                
            # 과거 고점 중에서 가장 높은 가격을 찾고, 기울기가 160 이하인 경우
            for prev_peak in all_previous_peaks:
                dx = (next_peak[0] - prev_peak[0]) / x_range * 100
                dy = (next_peak[1] - prev_peak[1]) / y_range * 100
                new_slope = dy / dx * 100
         
                    
                if new_slope <= 160 and prev_peak[1] > highest_price:
                    highest_price = prev_peak[1]
                    highest_valid_peak = prev_peak
          
                # 조건을 만족하는 과거 고점을 찾은 경우
                if highest_valid_peak:
                    draw_trendline_with_parallel(highest_valid_peak[0], highest_valid_peak[1],
                                        next_peak[0], next_peak[1],
                                        recent_waves[i+1]['Wave_Low_Index'],
                                        recent_waves[i+1]['Wave_Low'])
                    highest_valid_peak = None
            continue
            
        # 기울기가 -30도보다 작을 때는 기존 로직 그대로 적용
        elif slope < -30:
            # 기존 로직 적용 (미래 고점 찾기)
            future_peaks = recent_peaks[i+1:]
            valid_peak = None
            min_positive_slope = float('inf')
            min_negative_slope = float('-inf')
            positive_peak = None
            negative_peak = None
            
            for future_peak in future_peaks:
                new_slope = (future_peak[1] - current_peak[1]) / (future_peak[0] - current_peak[0])
                if not does_line_cross_price(df, current_peak[0], current_peak[1], 
                                           future_peak[0], future_peak[1]):
                    if 0 <= new_slope <= 160:
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
            
            # 다음 고점과도 연결
            draw_trendline_with_parallel(current_peak[0], current_peak[1],
                                         next_peak[0], next_peak[1],
                                         recent_waves[i+1]['Wave_Low_Index'],
                                         recent_waves[i+1]['Wave_Low'])
            continue
        
        # 기울기가 0~-30도 사이일 때는 기존 로직과 다음 고점 연결 둘 다 적용
        elif -30 <= slope < 0:
            # 기존 로직 적용 (미래 고점 찾기)
         
            future_peaks = recent_peaks[i+1:]
            valid_peak = None
            min_positive_slope = float('inf')
            min_negative_slope = float('-inf')
            positive_peak = None
            negative_peak = None
            
            # 다음 고점과 직접 연결 (이 부분을 조건문 시작 부분으로 이동)
            draw_trendline_with_parallel(current_peak[0], current_peak[1],
                                       next_peak[0], next_peak[1],
                                       recent_waves[i+1]['Wave_Low_Index'],
                                       recent_waves[i+1]['Wave_Low'])
            
            for future_peak in future_peaks:
                new_slope = (future_peak[1] - current_peak[1]) / (future_peak[0] - current_peak[0])
                if not does_line_cross_price(df, current_peak[0], current_peak[1], 
                                           future_peak[0], future_peak[1]):
                    if 0 <= new_slope <= 160:
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
            
            # 다음 고점과도 연결
            draw_trendline_with_parallel(current_peak[0], current_peak[1],
                                         next_peak[0], next_peak[1],
                                         recent_waves[i+1]['Wave_Low_Index'],
                                         recent_waves[i+1]['Wave_Low'])
            continue
        
        # 그 외의 경우(기울기가 0 이상): 인접한 고점끼리 연결
        draw_trendline_with_parallel(current_peak[0], current_peak[1],
                                     next_peak[0], next_peak[1],
                                     recent_waves[i+1]['Wave_Low_Index'],
                                     recent_waves[i+1]['Wave_Low'])
   

    ax.set_title('Stock Price Waves Analysis')
    ax.grid(True, alpha=0.2)
    ax.legend()
    
    plt.tight_layout()
    plt.show()

def analyze_stock_data():
    df = load_data()
    peaks = find_peaks(df)
    waves = analyze_waves(df, peaks)
    filtered_waves, filtered_peaks = filter_waves(waves, peaks)
    
    # trend_lines 받아서 출력
    trend_lines = generate_trend_lines(df, filtered_peaks, filtered_waves)

    print("\n=== 저항선 정보 ===")
    print("주요 저항선 개수:", len(trend_lines["trends"]))
    print(trend_lines['trends'])

    
    print("\n=== 지지선 정보 ===")
    print("지지선 개수:", len(trend_lines["parallels"]))

    print(trend_lines['parallels'])
    
    # 필터링된 데이터로 정보 출력
    print("\n=== 주요 고점 정보 ===")
    for i, (idx, price) in enumerate(filtered_peaks, 1):
        date = df.iloc[idx]['Date']
        print(f"고점 {i}: 날짜 - {date}, 가격 - {price:,.0f}")
    
    # 필터링된 데이터로 시각화
    plot_waves(df, filtered_peaks, filtered_waves)
  

def generate_trend_lines(df, peaks, waves):
    trend_lines = {
        "trends": [],      # 주요 추세선
        "parallels": []    # 평행선
    }
    
    def add_trend_and_parallel(x1, y1, x2, y2, wave_low_x, wave_low_y):
        # 같은 x 좌표를 가진 점 처리
        if x2 - x1 == 0:
            return

        # 현재 고점(x2, y2)을 지나는 모든 가능한 추세선들 찾기
        valid_connections = []
        for prev_peak in peaks:
            if prev_peak[0] >= x2:
                continue
                
            prev_slope = (y2 - prev_peak[1]) / (x2 - prev_peak[0])
            if -30 <= prev_slope <= 160 and not does_line_cross_price(df, prev_peak[0], prev_peak[1], x2, y2):
                valid_connections.append(prev_peak)
        
        if valid_connections:
            # 시간순으로 정렬
            valid_connections.sort(key=lambda x: x[0])
            # 가장 오래된 고점과 가장 최근 고점만 선택
            oldest_peak = valid_connections[0]
            # newest_peak = valid_connections[-1]
            
            # 가장 오래된 고점과의 추세선 (중복 체크)
            new_trend = {
                "start": (oldest_peak[0], oldest_peak[1]),
                "end": (x2, y2),
                "slope": (y2 - oldest_peak[1]) / (x2 - oldest_peak[0])
            }
            
            # 중복 체크
            if not any(
                t["start"] == new_trend["start"] and 
                t["end"] == new_trend["end"] and 
                abs(t["slope"] - new_trend["slope"]) < 0.0001 
                for t in trend_lines["trends"]
            ):
                trend_lines["trends"].append(new_trend)
            
            # # 가장 최근 고점과의 추세선 (오래된 것과 다른 경우에만)
            # if newest_peak != oldest_peak:
            #     new_trend = {
            #         "start": (newest_peak[0], newest_peak[1]),
            #         "end": (x2, y2),
            #         "slope": (y2 - newest_peak[1]) / (x2 - newest_peak[0])
            #     }
                
            #     # 중복 체크
            #     if not any(
            #         t["start"] == new_trend["start"] and 
            #         t["end"] == new_trend["end"] and 
            #         abs(t["slope"] - new_trend["slope"]) < 0.0001 
            #         for t in trend_lines["trends"]
            #     ):
            #         trend_lines["trends"].append(new_trend)
            if(oldest_peak[0] == x1):
                # 평행선 정보 저장 - 조건문 밖으로 이동
                parallel_slope = (y2 - y1) / (x2 - x1)
                parallel_intercept = wave_low_y - parallel_slope * wave_low_x
                
                # 지지선 중복 체크
                new_parallel = {
                    "start": (wave_low_x, wave_low_y),
                    "slope": parallel_slope,
                    "intercept": parallel_intercept
                }
                
                if not any(
                    p["start"] == new_parallel["start"] and 
                    abs(p["slope"] - new_parallel["slope"]) < 0.0001 
                    for p in trend_lines["parallels"]
                ):
                    trend_lines["parallels"].append(new_parallel)

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
        dx = (next_peak[0] - current_peak[0]) / x_range * 100  # x 변화량을 100 기준으로 정규화
        dy = (next_peak[1] - current_peak[1]) / y_range * 100  # y 변화량을 100 기준으로 정규화
        slope = dy / dx * 100  # 실제 각도에 가까운 기울기

        # 기울기가 160 이상인 경우는 그대로 유지
        if slope > 160:
            all_previous_peaks = recent_peaks[:i+1]
            highest_valid_peak = None
            highest_price = 0
                
            # 과거 고점 중에서 가장 높은 가격을 찾고, 기울기가 160 이하인 경우
            for prev_peak in all_previous_peaks:
                dx = (next_peak[0] - prev_peak[0]) / x_range * 100
                dy = (next_peak[1] - prev_peak[1]) / y_range * 100
                new_slope = dy / dx * 100
                    
                if new_slope <= 160 and prev_peak[1] > highest_price:
            
                    highest_price = prev_peak[1]
                    highest_valid_peak = prev_peak
            
            # 조건을 만족하는 과거 고점을 찾은 경우
            if highest_valid_peak:
                add_trend_and_parallel(highest_valid_peak[0], highest_valid_peak[1],
                                     next_peak[0], next_peak[1],
                                     recent_waves[i+1]['Wave_Low_Index'],
                                     recent_waves[i+1]['Wave_Low'])
            continue
            
        # 기울기가 -30도보다 작을 때는 기존 로직 그대로 적용
        if slope < -30:
            # 기존 로직 적용 (미래 고점 찾기)
            future_peaks = recent_peaks[i+1:]
            valid_peak = None
            min_positive_slope = float('inf')
            min_negative_slope = float('-inf')
            positive_peak = None
            negative_peak = None
            
            for future_peak in future_peaks:
                new_slope = (future_peak[1] - current_peak[1]) / (future_peak[0] - current_peak[0])
                if not does_line_cross_price(df, current_peak[0], current_peak[1], 
                                           future_peak[0], future_peak[1]):
                    if 0 <= new_slope <= 160:
                        if new_slope < min_positive_slope:
                            min_positive_slope = new_slope
                            positive_peak = future_peak
                    elif new_slope > min_negative_slope:
                        min_negative_slope = new_slope
                        negative_peak = future_peak
            
            valid_peak = positive_peak if positive_peak else negative_peak
            
            if valid_peak:
                valid_peak_idx = next(idx for idx, peak in enumerate(recent_peaks) if peak[0] == valid_peak[0])
                add_trend_and_parallel(current_peak[0], current_peak[1],
                                     valid_peak[0], valid_peak[1],
                                     recent_waves[valid_peak_idx]['Wave_Low_Index'],
                                     recent_waves[valid_peak_idx]['Wave_Low'])
            
            # 다음 고점과도 연결
            add_trend_and_parallel(current_peak[0], current_peak[1],
                                     next_peak[0], next_peak[1],
                                     recent_waves[i+1]['Wave_Low_Index'],
                                     recent_waves[i+1]['Wave_Low'])
            continue
        
        # 기울기가 0~-30도 사이일 때는 기존 로직과 다음 고점 연결 둘 다 적용
        if -30 <= slope < 0:
            # 기존 로직 적용 (미래 고점 찾기)
            future_peaks = recent_peaks[i+1:]
            valid_peak = None
            min_positive_slope = float('inf')
            min_negative_slope = float('-inf')
            positive_peak = None
            negative_peak = None
            
            # 다음 고점과 직접 연결 (이 부분을 조건문 시작 부분으로 이동)
            add_trend_and_parallel(current_peak[0], current_peak[1],
                                   next_peak[0], next_peak[1],
                                   recent_waves[i+1]['Wave_Low_Index'],
                                   recent_waves[i+1]['Wave_Low'])
            
            for future_peak in future_peaks:
                new_slope = (future_peak[1] - current_peak[1]) / (future_peak[0] - current_peak[0])
                if not does_line_cross_price(df, current_peak[0], current_peak[1], 
                                           future_peak[0], future_peak[1]):
                    if 0 <= new_slope <= 160:
                        if new_slope < min_positive_slope:
                            min_positive_slope = new_slope
                            positive_peak = future_peak
                    elif new_slope > min_negative_slope:
                        min_negative_slope = new_slope
                        negative_peak = future_peak
            
            valid_peak = positive_peak if positive_peak else negative_peak
            
            if valid_peak:
                valid_peak_idx = next(idx for idx, peak in enumerate(recent_peaks) if peak[0] == valid_peak[0])
                add_trend_and_parallel(current_peak[0], current_peak[1],
                                     valid_peak[0], valid_peak[1],
                                     recent_waves[valid_peak_idx]['Wave_Low_Index'],
                                     recent_waves[valid_peak_idx]['Wave_Low'])
            
            # 다음 고점과도 연결
            add_trend_and_parallel(current_peak[0], current_peak[1],
                                     next_peak[0], next_peak[1],
                                     recent_waves[i+1]['Wave_Low_Index'],
                                     recent_waves[i+1]['Wave_Low'])
            continue
        
        # 그 외의 경우(기울기가 0 이상): 인접한 고점끼리 연결
        add_trend_and_parallel(current_peak[0], current_peak[1],
                             next_peak[0], next_peak[1],
                             recent_waves[i+1]['Wave_Low_Index'],
                             recent_waves[i+1]['Wave_Low'])
    
    return trend_lines


def does_line_cross_price(df, x1, y1, x2, y2):
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

if __name__ == "__main__":
    analyze_stock_data()