import sqlite3
import pandas as pd
import numpy as np
from scipy.signal import argrelextrema
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

def load_data():
    conn = sqlite3.connect('stock_035900.db')
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

def detect_trend_changes(df, ma_period=20, long_ma_period=224, threshold_pct=2.0, window=10):
    original_df = df.copy()
    
    df['MA'] = df['Close'].rolling(window=ma_period).mean()
    df['MA224'] = df['Close'].rolling(window=long_ma_period).mean()
    df['Price_MA_Diff'] = df['Close'] - df['MA']
    
    df = df.dropna()
    
    prices = df['Close'].values
    price_ma_diff = df['Price_MA_Diff'].values
    ma224_values = df['MA224'].values
    data_length = len(prices)
    
    local_max_idx = argrelextrema(price_ma_diff, np.greater, order=window)[0]
    
    # 먼저 가격 고점 탐지
    price_peaks = []
    additional_peaks = find_peaks(original_df)
    for peak_idx, peak_price in additional_peaks:
        if peak_idx >= len(df):
            continue
            
        window_start = max(0, peak_idx - window)
        window_end = min(len(df), peak_idx + window + 1)
        
        try:
            volume_mean = df['Volume'].iloc[window_start:window_end].mean()
            volume_spike = df['Volume'].iloc[peak_idx] > volume_mean * 1.5
            
            price_peaks.append({
                'Index': peak_idx,
                'Date': original_df.index[peak_idx] if isinstance(original_df.index, pd.DatetimeIndex) else original_df['Date'].iloc[peak_idx],
                'Price': peak_price,
                'Volume_Spike': volume_spike,
                'Before_Change': 0,
                'After_Change': 0,
                'MA224': ma224_values[peak_idx] if peak_idx < len(ma224_values) else None,
                'Peak_Type': 'Price'
            })
        except IndexError:
            continue

    # MA 변곡점 탐지
    ma_changes = []
    
    for idx in local_max_idx:
        if idx < window or idx >= (data_length - window):
            continue
            
        try:
            if prices[idx] <= ma224_values[idx]:
                continue
            
            real_idx = df.index[idx]
            current_price = prices[idx]
            
            # 하락 추세 체크 (개선된 버전)
            is_downtrend = False
            
            # 이전 고점이나 변곡점과 비교
            for prev_idx in range(max(0, idx-100), idx):  # 최근 100일 데이터만 확인
                if prices[prev_idx] > current_price * 1.05:  # 이전 가격이 현재보다 5% 이상 높으면
                    # 이전 고점에서 현재까지 지속적인 하락 확인
                    price_section = prices[prev_idx:idx+1]
                    peaks_in_section = argrelextrema(price_section, np.greater)[0]
                    
                    # 고점들이 순차적으로 낮아지는지 확인
                    if len(peaks_in_section) >= 2:
                        peak_prices = price_section[peaks_in_section]
                        if np.all(np.diff(peak_prices) < 0):  # 고점들이 계속 낮아지면
                            is_downtrend = True
                            break
            
            if is_downtrend:
                continue
                
            before_change = (prices[idx] - prices[idx-window]) / prices[idx-window] * 100
            after_change = (prices[idx+window] - prices[idx]) / prices[idx] * 100
            
            if before_change > threshold_pct and after_change < -threshold_pct:
                ma_changes.append({
                    'Index': real_idx,
                    'Date': original_df.index[real_idx] if isinstance(original_df.index, pd.DatetimeIndex) else original_df['Date'].iloc[real_idx],
                    'Price': current_price,
                    'Volume_Spike': True if df['Volume'].iloc[idx] > df['Volume'].iloc[idx-window:idx+window].mean() * 1.5 else False,
                    'Before_Change': before_change,
                    'After_Change': after_change,
                    'MA224': ma224_values[idx],
                    'Peak_Type': 'MA'
                })
        except IndexError:
            continue

    # 고점과 고점 사이의 비슷한 가격대의 낮은 변곡점 제거
    filtered_ma_changes = []
    if ma_changes and price_peaks:
        # 고점들을 시간순으로 정렬
        sorted_peaks = sorted(price_peaks, key=lambda x: x['Index'])
        
        # 각 고점 구간별로 변곡점 처리 (마지막 고점 제외)
        for i in range(len(sorted_peaks) - 1):
            current_peak = sorted_peaks[i]
            next_peak = sorted_peaks[i + 1]
            
            # 현재 구간의 변곡점들 찾기
            section_points = [
                point for point in ma_changes 
                if (current_peak['Index'] < point['Index'] < next_peak['Index'] and
                    point['Price'] <= current_peak['Price'] and  # 첫번째 고점보다 높은 것 제외
                    point['Price'] <= next_peak['Price'] * 0.8 and  # 두번째 고점의 80% 이하만 포함
                    all(abs(point['Index'] - peak['Index']) > 30  # 모든 고점으로부터 30일 이상 떨어진 것만
                        for peak in sorted_peaks))
            ]
            
            if len(section_points) > 1:
                # 구간 내 변곡점들 중 비슷한 가격대(5% 이내)의 것들 그룹화
                price_groups = []
                processed_points = []
                
                for point in section_points:
                    group_found = False
                    for group in price_groups:
                        if abs(point['Price'] - group[0]['Price']) / group[0]['Price'] <= 0.1:
                            group.append(point)
                            group_found = True
                            break
                    if not group_found:
                        price_groups.append([point])
                
                # 각 그룹에서 평균값과 가장 가까운 변곡점 선택
                for group in price_groups:
                    if len(group) > 1:
                        avg_price = sum(p['Price'] for p in group) / len(group)
                        closest_point = min(group, key=lambda x: abs(x['Price'] - avg_price))
                        processed_points.append(closest_point)
                    else:
                        processed_points.append(group[0])
                
                filtered_ma_changes.extend(processed_points)
            else:
                filtered_ma_changes.extend(section_points)

    # 모든 포인트 합치기
    all_points = price_peaks + filtered_ma_changes
    trend_changes = pd.DataFrame(all_points)
    
    if not trend_changes.empty:
        trend_changes = trend_changes.sort_values('Index')

    return trend_changes, original_df

def plot_stock_with_trends(df, trend_changes):
    plt.style.use('dark_background')
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(15, 10), height_ratios=[3, 1])
    fig.patch.set_facecolor('#1f1f1f')
    
    ax1.plot(range(len(df)), df['Close'], color='white', label='주가', alpha=0.7)
    
    for _, point in trend_changes.iterrows():
        idx = point['Index']
        color = 'red' if point['Peak_Type'] == 'MA' else 'yellow'
        marker = '^' if point['Peak_Type'] == 'MA' else '*'
        label = 'MA 변곡점' if point['Peak_Type'] == 'MA' else '가격 고점'
        
        ax1.plot(idx, point['Price'], marker=marker, color=color, 
                markersize=10, label=label)
        
        ax1.annotate(f'{point["Price"]:.2f}',
                    xy=(idx, point['Price']),
                    xytext=(10, 10),
                    textcoords='offset points',
                    color=color,
                    fontsize=8)
    
    ax2.bar(range(len(df)), df['Volume'], color='lightblue', alpha=0.5)
    
    for _, point in trend_changes.iterrows():
        if point['Volume_Spike']:
            idx = point['Index']
            ax2.bar(idx, df['Volume'].iloc[idx], color='yellow', alpha=0.7)
    
    ax1.set_title('주가 차트와 저항점 (MA 변곡점 & 가격 고점)', color='white', pad=20)
    ax1.set_ylabel('가격', color='white')
    ax1.grid(True, alpha=0.2)
    ax2.set_ylabel('거래량', color='white')
    ax2.grid(True, alpha=0.2)
    
    handles, labels = ax1.get_legend_handles_labels()
    by_label = dict(zip(labels, handles))
    ax1.legend(by_label.values(), by_label.keys(), loc='upper right')
    
    plt.tight_layout()
    plt.show()

def analyze_stock_data():
    df = load_data()
    
    if isinstance(df['Date'].iloc[0], str):
        df['Date'] = pd.to_datetime(df['Date'])
    
    trend_changes, original_df = detect_trend_changes(df)
    
    print("\n=== 탐지된 저항점 ===")
    if len(trend_changes) > 0:
        for _, row in trend_changes.iterrows():
            print(f"유형: {'MA 변곡점' if row['Peak_Type'] == 'MA' else '가격 고점'}")
            print(f"날짜: {row['Date']}")
            print(f"가격: {row['Price']:.2f}")
            print(f"224일 이평선: {row['MA224']:.2f}")
            print(f"거래량 스파이크: {'있음' if row['Volume_Spike'] else '없음'}")
            if row['Peak_Type'] == 'MA':
                print(f"이전 변화율: {row['Before_Change']:.2f}%")
                print(f"이후 변화율: {row['After_Change']:.2f}%")
            print("-" * 50)
    else:
        print("탐지된 저항점이 없습니다.")
    
    plot_stock_with_trends(original_df, trend_changes)
    
    return df, trend_changes

if __name__ == "__main__":
    df, trend_changes = analyze_stock_data()