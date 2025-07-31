
import pandas as pd
import numpy as np
from datetime import datetime

class MACrossSignalDetector:
    def __init__(self, length=7, confirm_bars=1):
        self.length = length  # 이동평균 기간
        self.confirm_bars = confirm_bars  # 확인 봉 수
    
    def calculate_ma_cross_signal(self, df):
        """이동평균 크로스 신호 계산"""
        if len(df) < self.length + self.confirm_bars + 1:
            return None
        
        # 데이터프레임 복사
        data = df.copy()
        
        # 이동평균 계산
        data['ma'] = data['close'].rolling(window=self.length).mean()
        
        # 가격이 이동평균 위에 있는지 확인
        data['above_ma'] = data['close'] > data['ma']
        data['below_ma'] = data['close'] < data['ma']
        
        # Pine Script의 bcount 로직 구현 (연속으로 위에 있는 횟수)
        data['bcount'] = 0
        for i in range(1, len(data)):
            if data.loc[data.index[i], 'above_ma']:
                data.loc[data.index[i], 'bcount'] = data.loc[data.index[i-1], 'bcount'] + 1
            else:
                data.loc[data.index[i], 'bcount'] = 0
        
        # Pine Script의 scount 로직 구현 (연속으로 아래에 있는 횟수)
        data['scount'] = 0
        for i in range(1, len(data)):
            if data.loc[data.index[i], 'below_ma']:
                data.loc[data.index[i], 'scount'] = data.loc[data.index[i-1], 'scount'] + 1
            else:
                data.loc[data.index[i], 'scount'] = 0
        
        # 최신 데이터 확인
        latest = data.iloc[-1]
        
        signal = None
        signal_type = None
        
        # 롱 진입 신호 (bcount == confirmBars)
        if latest['bcount'] == self.confirm_bars:
            signal = 'BUY'
            signal_type = 'LONG_ENTRY'
        
        # 롱 청산 신호 (scount == confirmBars)
        elif latest['scount'] == self.confirm_bars:
            signal = 'SELL'
            signal_type = 'LONG_EXIT'
        
        return {
            'signal': signal,
            'signal_type': signal_type,
            'price': latest['close'],
            'ma': latest['ma'],
            'bcount': latest['bcount'],
            'scount': latest['scount'],
            'above_ma': latest['above_ma'],
            'below_ma': latest['below_ma'],
            'timestamp': datetime.now()
        }