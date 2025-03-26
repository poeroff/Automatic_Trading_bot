import pandas as pd
import sqlite3
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



def find_peaks(dataframe, high_column='Close', compare_window=23, min_gap=50, threshold=0.2):
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





def plot_inflection_points_with_peaks(dataframe, peaks):
    import matplotlib.pyplot as plt

    plt.figure(figsize=(15, 8))
    plt.plot(dataframe['Close'], label='Stock Price', color='blue', alpha=0.7)

    # 고점 표시
    peak_indices = [peak[0] for peak in peaks]
    peak_prices = [peak[1] for peak in peaks]
    plt.scatter(peak_indices, peak_prices, color='red', marker='^', s=100, label='Peaks')

   


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
    peaks = find_peaks(df)  # 고점 찾기
    plot_inflection_points_with_peaks(df, peaks)