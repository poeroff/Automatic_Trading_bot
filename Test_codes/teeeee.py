import sqlite3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import argrelextrema

def load_data():
    conn = sqlite3.connect('stock_083420.db')
    query = "SELECT * FROM stock_data"
    df = pd.read_sql(query, conn)
    conn.close()
    
    df["Date"] = df["Date"].astype(int).astype(str)
    df["Date"] = pd.to_datetime(df["Date"], format="%Y%m%d")
    
    return df

def find_peaks(dataframe, high_column='High', compare_window=23, threshold=0.2):
    min_gap = 101
    
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
    find_peaks=[]
    if peaks:
        find_peaks = [peaks[0]]
        for i in range(0, len(peaks) - 1):
            current_peak = peaks[i]
            next_peak = peaks[i + 1]
            if current_peak[1] < next_peak[1]:
                find_peaks.append(peaks[i+1])

   
    return find_peaks or peaks  # peaks가 비어있으면 빈 리스트 반환


# 중복 제거 함수
def remove_duplicates(initial_peaks, peak_indices1):
    seen = set(peak_indices1)
    return [x for x in initial_peaks if x not in seen or seen.remove(x)]

def find_improved_peaks(self, df, high_column='High', window=20):
        """
        개선된 변곡점 찾기 알고리즘
        """
        prices = df[high_column].values
        peaks = []
        
        # 이동평균 계산
        ma = np.convolve(prices, np.ones(window)/window, mode='valid')
        ma = np.pad(ma, (window-1, 0), mode='edge')  # 패딩 추가
        
        # 기울기 계산
        gradient = np.gradient(ma)
        
        for i in range(window, len(prices)-window):
            # 기울기 변화 확인
            if gradient[i-1] > 0 and gradient[i+1] < 0:
                # 주변 윈도우에서 최대값인지 확인
                if prices[i] == max(prices[i-window:i+window]):
                    peaks.append(i)
        
        return peaks

def find_peaks_combined(df):
    # 1. 주요 고점 찾기
    peaks1 = find_peaks(df, 'High', compare_window=23, threshold=0.2)
    peak_indices1 = [idx for idx, _ in peaks1]
    peak_dates1 = df.iloc[peak_indices1]["Date"]
    peak_prices1 = [price for _, price in peaks1]
    # df["High_diff1"] = np.gradient(df["High"].values)

    # # 2차 미분 (가속도)
    # df["High_diff2"] = np.gradient(df["High_diff1"].values)

    # # 변곡점 찾기 (2차 미분이 0을 지나면서 부호가 바뀌는 지점)
    # df["Sign"] = np.sign(df["High_diff2"])  # 부호 계산
    # df["Sign_change"] = (df["Sign"].diff() > 0)

    # # 변곡점 인덱스 추출
    # initial_peaks = df[df["Sign_change"]].index.to_numpy()
    # 2. 변곡점 찾기 (order=n)
    n = 6
    initial_peaks = argrelextrema(df["High"].values, np.greater_equal, order=n)[0]
    unique_initial_peaks = remove_duplicates(initial_peaks, peak_indices1)

    initial_peaks_df = df.iloc[unique_initial_peaks][["Date", "High"]]
    initial_rising_peaks = initial_peaks_df[initial_peaks_df["High"].diff() > 0]

    # 3. 저장된 변곡점에서 고점 주변 15일 이내 제거
    filtered_peaks = initial_rising_peaks[~initial_rising_peaks.index.map(
        lambda x: any(abs(x - peak_idx) <= 13 for peak_idx in peak_indices1)
    )]
    
    # 변곡점 날짜를 datetime 변환
    filtered_peaks.loc[:, "Date"] = pd.to_datetime(filtered_peaks["Date"])
    filtered_peaks = filtered_peaks.sort_values("Date")  # 날짜 순 정렬

    final_filtered_peaks_peaks = []  # 최종 변곡점을 저장할 리스트
    i = 0
    
    while i < len(filtered_peaks):
        current_date = filtered_peaks.iloc[i]["Date"]
        current_high = filtered_peaks.iloc[i]["High"]
        three_months_later = current_date + pd.DateOffset(months=4)

        candidates = filtered_peaks[(filtered_peaks["Date"] > current_date) & 
                                    (filtered_peaks["Date"] <= three_months_later)]
        
        if not candidates.empty:
            max_peak = candidates.loc[candidates["High"].idxmax()]
            if max_peak["High"] > current_high:
                final_filtered_peaks_peaks.append({"Date": max_peak["Date"], "High": max_peak["High"]})
                i = filtered_peaks.index.get_loc(max_peak.name) + 1
                continue

        final_filtered_peaks_peaks.append({"Date": filtered_peaks.iloc[i]["Date"], "High": filtered_peaks.iloc[i]["High"]})
        i += 1

    final_peaks_df = pd.DataFrame(final_filtered_peaks_peaks)
    return peak_dates1, peak_prices1, final_peaks_df

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
