import pandas as pd
import numpy as np
from scipy.signal import argrelextrema

def detect_significant_highs(data, window=10, price_pct_change=15, volume_ratio=2.0):
    """
    과거 데이터만을 기반으로 의미 있는 고점을 탐지합니다.
    
    Parameters:
    - data (DataFrame): 주가 데이터
    - window (int): 로컬 최대값을 찾기 위한 윈도우 크기
    - price_pct_change (float): 고점 이후 최소 하락률(%)
    - volume_ratio (float): 평균 대비 최소 거래량 비율
    
    Returns:
    - highs (list): 의미 있는 고점 정보 (date, price, code_id)
    """
    significant_highs = []
    
    # code_id별로 데이터를 그룹화
    for code_id, group in data.groupby('code_id'):
        # 날짜 기준으로 정렬
        group = group.sort_values('date')
        
        # 거래량 이동 평균 계산
        group['volume_ma'] = group['volume'].rolling(window=20).mean()
        
        # 로컬 최대값 찾기 (argrelextrema 사용)
        max_idx = argrelextrema(group['high'].values, np.greater_equal, order=window)[0]
        
        for idx in max_idx:
            if idx < window or idx >= len(group) - window:
                continue
                
            high_price = group.iloc[idx]['high']
            high_date = group.iloc[idx]['date']
            
            # 고점 이후 일정 기간 내 최저가 확인
            future_period = min(window*2, len(group) - idx - 1)
            if future_period < window:  # 충분한 미래 데이터가 없으면 스킵
                continue
                
            future_min = min(group.iloc[idx+1:idx+future_period+1]['low'])
            price_drop = (high_price - future_min) / high_price * 100
            
            # 거래량 조건 확인
            volume = group.iloc[idx]['volume']
            avg_volume = group.iloc[idx]['volume_ma']
            
            # 추가 조건: 고점 전 상승 추세 확인
            prev_period = min(window*2, idx)
            prev_min = min(group.iloc[idx-prev_period:idx]['low'])
            price_rise = (high_price - prev_min) / prev_min * 100
            
            # 고점 조건:
            # 1. 가격이 고점 이후 price_pct_change% 이상 하락
            # 2. 거래량이 평균 대비 volume_ratio배 이상
            # 3. 고점 전 price_pct_change/2% 이상 상승
            if (price_drop >= price_pct_change and 
                volume >= avg_volume * volume_ratio and
                price_rise >= price_pct_change/2):
                
                significant_highs.append({
                    'date': high_date,
                    'price': high_price,
                    'code_id': code_id,
                    'drop_pct': price_drop,
                    'volume_ratio': volume/avg_volume if not pd.isna(avg_volume) and avg_volume > 0 else 0
                })
    
    # 중요도 순으로 정렬
    significant_highs.sort(key=lambda x: (x['drop_pct'] * x['volume_ratio']), reverse=True)
    
    return significant_highs

# CSV 데이터 로드
data = pd.read_csv('./Test_codes/test1.csv', sep=';')

# 데이터 전처리
data['high'] = pd.to_numeric(data['high'], errors='coerce')
data['low'] = pd.to_numeric(data['low'], errors='coerce')
data['volume'] = pd.to_numeric(data['volume'], errors='coerce')

# 의미 있는 고점 탐지
highs = detect_significant_highs(data, window=10, price_pct_change=15, volume_ratio=2.0)

# 결과 출력
print(f"의미 있는 고점 수: {len(highs)}")
for i, high in enumerate(highs):
    if i >= 20:  # 상위 20개만 출력
        break
    print(f"고점: {high['date']}, 가격: {high['price']}, 회사 ID: {high['code_id']}, 하락률: {high['drop_pct']:.2f}%, 거래량비율: {high['volume_ratio']:.2f}x")
