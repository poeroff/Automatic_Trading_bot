# import numpy as np
# import pandas as pd
# import matplotlib.pyplot as plt
# from pyampd.ampd import find_peaks  # 정확한 경로에서 함수 가져오기
# import sqlite3




# def load_data():
#     conn = sqlite3.connect('stock_008250.db')
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM stock_data")
#     data = cursor.fetchall()
#     columns = ["Date", "Open", "High", "Low", "Close", "Volume"]
#     df = pd.DataFrame(data, columns=columns)
#     conn.close()
#     return df


# # 데이터프레임 생성
# df = load_data()
# df['Date'] = pd.to_datetime(df['Date'], format='%Y%m%d')

# # 종가 추출
# closing_prices = df['Close'].values

# # AMPD 알고리즘으로 피크 감지
# peaks = find_peaks(closing_prices)

# peak_dates = df['Date'].iloc[peaks]
# peak_values = closing_prices[peaks]

# # 결과 시각화
# plt.figure(figsize=(10, 6))
# plt.plot(df['Date'], closing_prices, label="Closing Prices", color="blue")
# plt.scatter(df['Date'].iloc[peaks], closing_prices[peaks], color="red", label="Detected Peaks")
# plt.title("AMPD Algorithm - Peak Detection")
# plt.xlabel("Date")
# plt.ylabel("Closing Price")
# plt.legend()
# plt.show()

# # 감지된 피크 출력
# for date, value in zip(peak_dates, peak_values):
#     print(f"Date: {date}, Close: {value}")


import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pyampd.ampd import find_peaks
import sqlite3

def load_data():
    conn = sqlite3.connect('stock_008250.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stock_data")
    data = cursor.fetchall()
    columns = ["Date", "Open", "High", "Low", "Close", "Volume"]
    df = pd.DataFrame(data, columns=columns)
    conn.close()
    return df

# RSI 계산 함수
def compute_rsi(series, period=14):
    # 종가 차이
    delta = series.diff()

    # 상승분 / 하락분 추출
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    # 이동평균(EMA가 아니라 단순 rolling 평균으로 처리)
    avg_gain = gain.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period, adjust=False).mean()

    # 0으로 나누는 경우 방지
    rs = avg_gain / avg_loss

    # RSI 계산
    rsi = 100 - (100 / (1 + rs))
    return rsi

# 데이터 불러오기
df = load_data()
df['Date'] = pd.to_datetime(df['Date'], format='%Y%m%d')

# RSI 컬럼 추가 (기간 14 예시)
df['RSI'] = compute_rsi(df['Close'], period=14)

# 처음 몇 개 구간은 rolling으로 인해 NaN이 생기므로 제거
df.dropna(inplace=True)

# 종가 배열
closing_prices = df['Close'].values

# AMPD 알고리즘을 이용해 모든 피크 인덱스 찾기
all_peaks = find_peaks(closing_prices)

# RSI가 80을 넘는 피크만 필터링
filtered_peaks = [p for p in all_peaks if df.iloc[p]['RSI'] >= 70]

# 피크 정보
peak_dates_filtered = df.iloc[filtered_peaks]['Date']
peak_values_filtered = df.iloc[filtered_peaks]['Close']

# 결과 시각화
plt.figure(figsize=(10, 6))
plt.plot(df['Date'], df['Close'], label="Closing Prices")
plt.scatter(peak_dates_filtered, peak_values_filtered,
            color="red", label="Detected Peaks (RSI > 80)")
plt.title("AMPD Peak Detection with RSI Filter")
plt.xlabel("Date")
plt.ylabel("Closing Price")
plt.legend()
plt.show()

# 필터링된 피크 출력
for date, value in zip(peak_dates_filtered, peak_values_filtered):
    print(f"Date: {date}, Close: {value}, RSI: {df.loc[df['Date'] == date, 'RSI'].values[0]:.2f}")
