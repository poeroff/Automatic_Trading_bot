import pandas as pd
import sqlite3
import numpy as np
import matplotlib.pyplot as plt

def load_data():
    conn = sqlite3.connect('stock_096350.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stock_data")
    data = cursor.fetchall()
    columns = ["Date", "Open", "High", "Low", "Close", "Volume"]
    df = pd.DataFrame(data, columns=columns)
    conn.close()
    return df

def find_peaks(dataframe, high_column='Close', compare_window=60, min_gap=180, threshold=0.30):
    peaks = []
    prices = dataframe[high_column].values
    last_peak_idx = -min_gap
    last_peak_price = 0
    
    for i in range(compare_window, len(dataframe)):
        window_before = prices[max(0, i-compare_window):i]
        window_after = prices[i+1:min(len(prices), i+compare_window+1)]
        current_price = prices[i]
        
        if (current_price > np.max(window_before) and 
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

def calculate_ema(data, period):
    """224일 EMA 계산 함수"""
    return data.ewm(span=period, adjust=False).mean()

def find_inflection_points_with_second_derivative(dataframe, threshold=0.01):
    """
    1차 및 2차 미분을 통해 변곡점 찾기
    """
    prices = dataframe['Close'].values
    second_derivative = np.diff(prices)  # 1차 미분 (변화율)

    
    inflection_points = []
    peaks = find_peaks(dataframe)  # 고점 찾기

    # 고점 인덱스 및 가격 저장
    peak_indices = [peak[0] for peak in peaks]
    peak_prices = [peak[1] for peak in peaks]

    for i in range(1, len(second_derivative) - 1):
        # 1차 미분이 0에 가까운 지점 찾기
        if abs(second_derivative[i]) < threshold:
            # 기울기의 부호 변화 확인
            if (second_derivative[i-1] > 0 and second_derivative[i+1] < 0) or (second_derivative[i-1] < 0 and second_derivative[i+1] > 0):
                # 고점 사이에 있는 변곡점 확인
                for j in range(len(peak_indices) - 1):
                    peak_idx_1 = peak_indices[j]
                    peak_idx_2 = peak_indices[j + 1]
                    
                    if peak_idx_1 < i + 1 < peak_idx_2:  # 변곡점이 두 고점 사이에 있는지 확인
                        # 첫 번째 고점보다 높은 변곡점 제거
                        if prices[i + 1] > peak_prices[j]:
                            break  # 첫 번째 고점보다 높은 변곡점은 추가하지 않음
                        else:
                            inflection_points.append((i + 1, prices[i + 1]))  # 원래 가격 인덱스에 맞춰 조정
                            break

    return inflection_points




def plot_inflection_points_with_peaks(dataframe, peaks):
    import matplotlib.pyplot as plt

    plt.figure(figsize=(15, 8))
    plt.plot(dataframe['Close'], label='Stock Price', color='blue', alpha=0.7)

    # 고점 표시
    peak_indices = [peak[0] for peak in peaks]
    peak_prices = [peak[1] for peak in peaks]
    plt.scatter(peak_indices, peak_prices, color='red', marker='^', s=100, label='Peaks')

    # 변곡점 표시 및 연결
    for j in range(len(peak_indices) - 1):
        peak_idx_1 = peak_indices[j]
        peak_idx_2 = peak_indices[j + 1]

        # 마지막 변곡점 찾기
        last_inflection = None
        for idx, price in inflection_points:
            if peak_idx_1 < idx < peak_idx_2:
                last_inflection = (idx, price)

        # 첫 번째 고점에서 마지막 변곡점까지 선 그리기
        if last_inflection:
            plt.plot([peak_idx_1, last_inflection[0]], [peak_prices[j], last_inflection[1]], color='red', linestyle='-', linewidth=2)

    # 변곡점 표시
    if inflection_points:
        inflection_indices = [idx for idx, _ in inflection_points]
        inflection_levels = [level for _, level in inflection_points]
        plt.scatter(inflection_indices, inflection_levels, color='orange', marker='o', s=100, label='Inflection Points')

    plt.title('Stock Price with Peaks and Inflection Points')
    plt.xlabel('Time')
    plt.ylabel('Price')
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.show()

# 메인 실행
if __name__ == "__main__":
    df = load_data()
    
    inflection_points = find_inflection_points_with_second_derivative(df)
    
    print("\n유효한 변곡점:")
    for idx, inflection_level in inflection_points:
        print(f"인덱스: {idx}, 변곡선: {inflection_level:.2f}, 날짜: {df['Date'].iloc[idx]}")

    peaks = find_peaks(df)  # 고점 찾기
    plot_inflection_points_with_peaks(df, peaks, inflection_points)