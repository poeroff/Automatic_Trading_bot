import sqlite3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 🔥 1. 주식 데이터 불러오기
def load_data():
    conn = sqlite3.connect("stock_005930.db")
    df = pd.read_sql("SELECT Date, High, Close, Low FROM stock_data", conn)  # High, Close 가져오기
    conn.close()
    return df

# 🔥 2. 사용자가 선택한 날짜 (YYYYMMDD 형식)
selected_dates = [20200120, 20200727, 20210111]

# 데이터 불러오기
df = load_data()

# X축 인덱스 만들기 (0부터 순차적)
df["Index"] = range(len(df))

# 선택한 날짜 필터링
selected_rows = df[df["Date"].isin(selected_dates)]
selected_rows = selected_rows.sort_values(by="Date")  # 정렬
print(selected_rows)

# X축: 날짜를 인덱스로 변환
dates_index = [df[df["Date"] == date].index[0] for date in selected_rows["Date"]]
highs = selected_rows["High"].values
print(highs)

# 🔥 3. 기본 추세선 (첫 번째 ~ 두 번째 고점)
latest_index = df["Index"].iloc[-1]  # 가장 최신 날짜의 인덱스
x_vals = np.linspace(dates_index[0], latest_index, 200)  # 최신 데이터까지 확장
slope = (highs[1] - highs[0]) / (dates_index[1] - dates_index[0])
base_trend = slope * (x_vals - dates_index[0]) + highs[0]

# 🔥 4. 피보나치 비율 적용
fib_levels = [1, 2, 3, 4]
# 채널 높이 계산 수정
time_diff = dates_index[2] - dates_index[0]  # 전체 시간 범위
price_at_third = slope * (dates_index[2] - dates_index[0]) + highs[0]  # 기준선의 세 번째 시점 가격
channel_height = highs[2] - price_at_third  # 실제 채널 높이

# 채널 계산
channels = {level: base_trend + channel_height * level for level in fib_levels}


# 🔥 5. 차트 그리기
plt.figure(figsize=(12, 6))

# 전체 주가 차트 (Close 가격)
plt.plot(df["Index"], df["Low"], color='gray', alpha=0.7, label="Stock Price (Close)")

# 기본 추세선 (최신 날짜까지 확장)
plt.plot(x_vals, base_trend, 'k-', label="Base Trend")

# 피보나치 채널 라인 (최신 날짜까지 확장)
for level, values in channels.items():
    plt.plot(x_vals, values, '--', label=f'Fib {level}')


# X축을 날짜로 표시
plt.legend()
plt.title("Stock Price with Fibonacci Channel (Extended to Latest Date)")
plt.xlabel("Date")
plt.ylabel("Price")
plt.grid()

plt.show()
