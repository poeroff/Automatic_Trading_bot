import pandas as pd
import numpy as np
import sqlite3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import argrelextrema


def load_data():
    conn = sqlite3.connect('stock_000020.db')
    query = "SELECT * FROM stock_data"
    df = pd.read_sql(query, conn)
    conn.close()
    
    df["Date"] = pd.to_datetime(df["Date"], format="%Y%m%d")
    print(df)
    return df

def find_peaks(dataframe, high_column='High', compare_window=23, threshold=0.2):
    min_gap = 50
    
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
    
    # 2. 이전 고점보다 낮은 고점 제거
    peak_dates1 = df.iloc[peak_indices1]["Date"]
    peak_prices1 = [price for _, price in peaks1]
    
    
    return peak_dates1, peak_prices1, filtered_peaks







def find_previous_peak(df, peak_dates1, peak_prices1, reference_date):
    if not isinstance(reference_date, pd.Timestamp):
        reference_date = pd.to_datetime(str(reference_date), format='%Y%m%d')
    
    previous_peaks = [(date, price) for date, price in zip(peak_dates1, peak_prices1) if date < reference_date]
    
    if not previous_peaks:
        return None, None
    
    latest_peak_date, latest_peak_price = max(previous_peaks, key=lambda x: x[0])
    
    return latest_peak_date, latest_peak_price

def find_closest_inflection_or_peak(filtered_peaks, peak_dates1, peak_prices1, reference_date):
    if not isinstance(reference_date, pd.Timestamp):
        reference_date = pd.to_datetime(str(reference_date), format='%Y%m%d')

    # reference_date 이후의 변곡점 필터링
    future_inflections = filtered_peaks[filtered_peaks['Date'] > reference_date]
    
    # reference_date 이후의 주요 고점 필터링
    future_peaks = peak_dates1[peak_dates1 > reference_date]

    # 가장 가까운 변곡점 찾기
    closest_inflection = future_inflections.iloc[0] if not future_inflections.empty else None

    # 가장 가까운 주요 고점 찾기
    closest_peak = future_peaks.iloc[0] if not future_peaks.empty else None

    # peak_prices1을 Series로 변환 (이게 핵심 해결 방법)
    peak_prices_series = pd.Series(peak_prices1, index=peak_dates1)

    # 두 개 중 reference_date와 가장 가까운 것 선택
    if closest_inflection is not None and closest_peak is not None:
        if abs(closest_inflection['Date'] - reference_date) < abs(closest_peak - reference_date):
            return closest_inflection['Date'], closest_inflection['High']
        else:
            return closest_peak, peak_prices_series.loc[closest_peak]

    elif closest_inflection is not None:
        return closest_inflection['Date'], closest_inflection['High']

    elif closest_peak is not None:
        return closest_peak, peak_prices_series.loc[closest_peak]

    return None, None


# 실행
df = load_data()
peak_dates1, peak_prices1, filtered_peaks = find_peaks_combined(df)




# 여러 개의 기준 날짜
reference_dates = [20230904]

plt.figure(figsize=(15, 10))

for i, reference_date in enumerate(reference_dates):
    previous_peak_date, previous_peak_price = find_previous_peak(df, peak_dates1, peak_prices1, reference_date)
    closest_date, closest_price = find_closest_inflection_or_peak(filtered_peaks, peak_dates1, peak_prices1, reference_date)

    if previous_peak_date is None:
        print(f"Skipping reference date {reference_date} due to missing previous peak")
        continue

    if closest_date is None:
        # 첫 번째와 두 번째 날짜만 사용
        selected_dates = [
            int(previous_peak_date.strftime('%Y%m%d')),
            reference_date
        ]
    else:
        selected_dates = [
            int(previous_peak_date.strftime('%Y%m%d')),
            reference_date,
            int(closest_date.strftime('%Y%m%d'))
        ]

    selected_rows = df[df["Date"].isin(pd.to_datetime(selected_dates, format='%Y%m%d'))]
    selected_rows = selected_rows.sort_values(by="Date")

    dates_index = selected_rows.index.tolist()
    highs = selected_rows["High"].values

    latest_index = df.index[-1]
    x_vals = np.linspace(dates_index[0], latest_index, 200)
    slope = (highs[1] - highs[0]) / (dates_index[1] - dates_index[0])
    base_trend = slope * (x_vals - dates_index[0]) + highs[0]

    # baseTrend 가격 출력
    print(f'Base Trend 가격: {base_trend[-1]}')  # 마지막 값이 현재의 baseTrend 가격

    plt.plot(df.index, df["Low"], color='gray', alpha=0.7, label="Stock Price (Low)" if i == 0 else "")
    plt.plot(x_vals, base_trend, '-', label=f"Base Trend {i+1}")

    if closest_date is not None:
        fib_levels = [1, 2, 3, 4]
        time_diff = dates_index[2] - dates_index[0]
        price_at_third = slope * (dates_index[2] - dates_index[0]) + highs[0]
        channel_height = highs[2] - price_at_third

        channels = {level: base_trend + channel_height * level for level in fib_levels}

        # 피보나치 선의 가격 출력
        for level, values in channels.items():
            print(f'피보나치 레벨 {level}: {int(values[-1])}')  # 마지막 값이 해당 레벨의 가격


        for level, values in channels.items():
            plt.plot(x_vals, values, '--', label=f'Fib {level} (Set {i+1})')

plt.legend()
plt.title("Stock Price with Fibonacci Channels")
plt.xlabel("Date")
plt.ylabel("Price")
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
