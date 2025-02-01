import sqlite3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import argrelextrema

def load_data():
    conn = sqlite3.connect('stock_080220.db')
    query = "SELECT * FROM stock_data"
    df = pd.read_sql(query, conn)
    conn.close()
    
    df["Date"] = df["Date"].astype(int).astype(str)
    df["Date"] = pd.to_datetime(df["Date"], format="%Y%m%d")
    
    return df

def find_peaks(dataframe, high_column='High', compare_window=23, threshold=0.2):
    time_diff = dataframe['Date'].iloc[1] - dataframe['Date'].iloc[0]
    min_gap = 50 if time_diff.days >= 7 else 186
    
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

def find_peaks_combined(df):
    # 1. 주요 고점 찾기
    peaks1 = find_peaks(df, 'High', compare_window=23, threshold=0.2)
    peak_indices1 = [idx for idx, _ in peaks1]

    # 2. 변곡점을 한 번만 계산하고 저장
    n = 6
    initial_peaks = argrelextrema(df["High"].values, np.greater_equal, order=n)[0]
    initial_peaks_df = df.iloc[initial_peaks][["Date", "High"]]
    initial_rising_peaks = initial_peaks_df[initial_peaks_df["High"].diff() > 0]
    
    # 3. 저장된 변곡점에서 고점 주변 15일 이내의 점들만 제거
    filtered_peaks = initial_rising_peaks[~initial_rising_peaks.index.map(
        lambda x: any(abs(x - peak_idx) <= 13 for peak_idx in peak_indices1)
    )]


    # 1. 주요 고점 찾기
    peaks1 = find_peaks(df, 'High', compare_window=23, threshold=0.2)
    
    # # 2. 이전 고점보다 낮은 고점 제거
    # final_peaks = []
    # max_price = 0
    
    # for idx, price in peaks1:
    #     if price > max_price:
    #         final_peaks.append((idx, price))
    #         max_price = price
    
    # peak_indices1 = [idx for idx, _ in final_peaks]
    peak_dates1 = df.iloc[peak_indices1]["Date"]
    peak_prices1 = [price for _, price in peaks1]
    # print(filtered_peaks)
    # print(peak_dates1)
    # print(peak_prices1)
    
    return peak_dates1, peak_prices1, filtered_peaks

def plot_combined_peaks(df, peak_dates1, peak_prices1, filtered_peaks):
    plt.figure(figsize=(15, 8))
    
    plt.plot(df["Date"], df["High"], color="red", label="High Price", alpha=0.8)
    
    plt.scatter(peak_dates1, peak_prices1, color="blue", marker="o", 
               label="Major Peaks", s=100, alpha=0.6)
    
    plt.scatter(filtered_peaks["Date"].values, 
                filtered_peaks["High"].values, 
                color="black", marker="^", label="Rising Peaks", 
                alpha=0.4, s=50)

    
    plt.xlabel("Date")
    plt.ylabel("High Price")
    plt.title("Stock High Prices with Combined Peak Detection")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

# 실행
df = load_data()
peak_dates1, peak_prices1, filtered_peaks = find_peaks_combined(df)
plot_combined_peaks(df, peak_dates1, peak_prices1, filtered_peaks)
