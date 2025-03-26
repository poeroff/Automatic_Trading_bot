import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pyampd.ampd import find_peaks  # 정확한 경로에서 함수 가져오기
import sqlite3

# 샘플 주식 데이터
data = {
    'Date': ['19850104', '19850107', '19850114', '19850121', '19850128', '19850204', '19850211', '19850218', '19850225', '19850304', '19850311', '19850318', '19850325'],
    'Close': [1598, 1622, 1613, 1596, 1644, 1654, 1647, 1766, 1924, 1888, 1983, 1998, 1976]
}



def load_data():
    conn = sqlite3.connect('stock_096350.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stock_data")
    data = cursor.fetchall()
    columns = ["Date", "Open", "High", "Low", "Close", "Volume"]
    df = pd.DataFrame(data, columns=columns)
    conn.close()
    return df


# 데이터프레임 생성
df = load_data()
df['Date'] = pd.to_datetime(df['Date'], format='%Y%m%d')

# 종가 추출
closing_prices = df['Close'].values

# AMPD 알고리즘으로 피크 감지
peaks = find_peaks(closing_prices)

peak_dates = df['Date'].iloc[peaks]
peak_values = closing_prices[peaks]

# 결과 시각화
plt.figure(figsize=(10, 6))
plt.plot(df['Date'], closing_prices, label="Closing Prices", color="blue")
plt.scatter(df['Date'].iloc[peaks], closing_prices[peaks], color="red", label="Detected Peaks")
plt.title("AMPD Algorithm - Peak Detection")
plt.xlabel("Date")
plt.ylabel("Closing Price")
plt.legend()
plt.show()

# 감지된 피크 출력
for date, value in zip(peak_dates, peak_values):
    print(f"Date: {date}, Close: {value}")
