import sqlite3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def load_data():
    conn = sqlite3.connect('stock_005930.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stock_data")
    data = cursor.fetchall()
    columns = ["Date", "Open", "High", "Low", "Close", "Volume"]
    df = pd.DataFrame(data, columns=columns)
    conn.close()
    return df


def find_peaks(dataframe, high_column='High', compare_window=20, min_gap=62, threshold=0.1):
    peaks = []
    prices = dataframe[high_column].values
    last_peak_idx = -min_gap
    last_peak_price = 0
    
    # 224일 이동평균선 계산
    ma224 = dataframe[high_column].rolling(window=224).mean()
    
    for i in range(compare_window, len(dataframe)):
        window_before = prices[max(0, i-compare_window):i]
        window_after = prices[i+1:min(len(prices), i+compare_window+1)]
        current_price = prices[i]
        
        # 현재 가격이 224일 이동평균선 위에 있는지 확인
        if (current_price > ma224.iloc[i] and
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


def analyze_waves(dataframe, peaks):
    waves = []
    prices = dataframe['Close'].values
    
    print("\n=== 파동 최저점 정보 ===")
    # 각 고점에서 시작하는 하락 파동의 분석
    for i in range(len(peaks)):
        peak_idx = peaks[i][0]
        next_idx = len(dataframe) if i == len(peaks)-1 else peaks[i+1][0]
        
        wave_section = dataframe['Low'].iloc[peak_idx:next_idx]
        current_min = float('inf')
        min_idx = peak_idx
        
        # 최저점과 반등 지점 찾기
        for j in range(1, len(wave_section)-1):
            current_price = wave_section.iloc[j]
            
            # 최저점 업데이트
            if current_price < current_min:
                current_min = current_price
                min_idx = wave_section.index[j]
            
            # 최저점 이후 10.7% 이상 상승 시 파동 종료로 간주
            if current_price >= current_min * 1.1:
                min_date = dataframe.iloc[min_idx]['Date']
                print(f"파동 {i+1} 최저점: 날짜 - {min_date}, 가격 - {current_min:,.0f}")
                
                waves.append({
                    'Wave_Number': i + 1,
                    'Start_Index': peak_idx,
                    'End_Index': next_idx,
                    'Start_Price': peaks[i][1],
                    'End_Price': peaks[i+1][1] if i < len(peaks)-1 else prices[-1],
                    'Wave_Low': current_min,
                    'Wave_Low_Index': min_idx,
                    'Wave_High': max(wave_section),
                    'Wave_Length': next_idx - peak_idx
                })
                break
        
    
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
            
            if price_diff_percent >= 50:
                # 40% 이상 높을 경우: 다음 고점과 가장 가까운 과거 고점 찾기
                all_previous_peaks = recent_peaks[:i+1]
                closest_peak = None
                min_diff = float('inf')
                
                # 가장 가까운 가격의 고점 찾기
                for prev_peak in all_previous_peaks:
                    diff = abs(prev_peak[1] - next_peak[1])
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
    plt.show()

def analyze_stock_data():
    df = load_data()
    peaks = find_peaks(df)
    waves = analyze_waves(df, peaks)
    filtered_waves, filtered_peaks = filter_waves(waves, peaks)


    # 필터링된 데이터로 정보 출력
    print("\n=== 주요 고점 정보 ===")
    for i, (idx, price) in enumerate(filtered_peaks, 1):
        date = df.iloc[idx]['Date']
        print(f"고점 {i}: 날짜 - {date}, 가격 - {price:,.0f}")
    
    # 필터링된 데이터로 시각화
    plot_waves(df, filtered_peaks, filtered_waves)






if __name__ == "__main__":
    analyze_stock_data()