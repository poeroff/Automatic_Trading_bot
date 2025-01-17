import numpy as np
from datetime import timedelta
import pandas as pd


class Trading_Technique:
    def __init__(self):
        pass

    def filter_waves(self,waves, peaks):
        filtered_waves = []
        filtered_peaks = []
        i = 0
        
        while i < len(waves)-1:
            if(waves[i]['Wave_Low'] < waves[i+1]['Wave_Low'] and peaks[i][1] > peaks[i+1][1]):
                filtered_waves.append(waves[i])
                filtered_peaks.append(peaks[i])
                i += 2  # i+1을 건너뛰고 그 다음 데이터로 이동
            else:
                filtered_waves.append(waves[i])
                filtered_peaks.append(peaks[i])
                i += 1
        
        # 마지막 데이터가 처리되지 않았다면 추가
        if i < len(waves):
            filtered_waves.append(waves[-1])
            filtered_peaks.append(peaks[-1])
        return filtered_waves, filtered_peaks
    
    def find_peaks(self,dataframe, high_column='High', compare_window=23, min_gap=184, threshold=0.2):
        peaks = []
        prices = dataframe[high_column].values
        last_peak_idx = -min_gap
        last_peak_price = 0
        
        # 224일 이동평균선 계산
        ma224 = dataframe[high_column].rolling(window=184).mean()
        
        for i in range(compare_window, len(dataframe)):
            window_before = prices[max(0, i-compare_window):i]
            window_after = prices[i+1:min(len(prices), i+compare_window+1)]
            current_price = prices[i]
            
            # 현재 가격이 224일 이동평균선 위에 있는지 확인
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

    def analyze_waves(self, dataframe, peaks):
        waves = []
        prices = dataframe['Close'].values
        # 날짜를 datetime 객체로 변환
        dates = pd.to_datetime(dataframe['Date'], format='%Y%m%d').values

        for i in range(len(peaks)):
            peak_idx = peaks[i][0]
            next_idx = len(dataframe) if i == len(peaks) - 1 else peaks[i + 1][0]
            
            wave_section = dataframe['Low'].iloc[peak_idx:next_idx]
            current_min = float('inf')
            min_idx = peak_idx
            max_rebound = 0  # 최대 반등 비율
            best_wave = None  # 최적의 파동 정보 저장

            # 고점 날짜를 pandas.Timestamp로 변환
            peak_date = pd.Timestamp(dates[peak_idx])
            
            for j in range(1, len(wave_section) - 1):
                current_price = wave_section.iloc[j]
                current_date = pd.Timestamp(dates[wave_section.index[j]])  # 현재 날짜를 pandas.Timestamp로 변환

                # 1년 이내 조건 확인
                if current_date > peak_date + timedelta(days=365):
                    break  # 1년이 넘으면 더 이상 검사하지 않음

                if current_price < current_min:
                    current_min = current_price
                    min_idx = wave_section.index[j]
                    continue  # 새로운 최저점을 찾았으므로 다음 반복으로

                # 현재 가격의 반등 비율 계산
                rebound_ratio = (current_price - current_min) / current_min

                # 10~17% 사이의 반등이고, 지금까지 찾은 것보다 더 큰 반등이면 저장
                if 0.1 <= rebound_ratio <= 0.175 and rebound_ratio > max_rebound:
                    max_rebound = rebound_ratio
                    best_wave = {
                        'Wave_Number': i + 1,
                        'Start_Index': peak_idx,
                        'End_Index': next_idx,
                        'Start_Price': peaks[i][1],
                        'End_Price': peaks[i + 1][1] if i < len(peaks) - 1 else prices[-1],
                        'Wave_Low': current_min,
                        'Wave_Low_Index': min_idx,
                        'Wave_High': max(wave_section),
                        'Wave_Length': next_idx - peak_idx,
                        'Rebound_Ratio': rebound_ratio * 100  # 백분율로 변환
                    }

            # 10~17% 사이의 반등을 찾은 경우
            if best_wave:
                waves.append(best_wave)
            else:
                # 반등이 없거나 조건에 맞지 않는 경우 기본 정보 저장
                waves.append({
                    'Wave_Number': i + 1,
                    'Start_Index': peak_idx,
                    'End_Index': next_idx,
                    'Start_Price': peaks[i][1],
                    'End_Price': peaks[i + 1][1] if i < len(peaks) - 1 else prices[-1],
                    'Wave_Low': min(wave_section),
                    'Wave_Low_Index': wave_section.idxmin(),
                    'Wave_High': max(wave_section),
                    'Wave_Length': next_idx - peak_idx,
                    'Rebound_Ratio': 0  # 조건에 맞는 반등 없음
                })

        return waves

    def generate_trend_lines(self, df, peaks, waves):
        trend_lines = {
            "trends": [],      # 주요 추세선
            "parallels": []    # 평행선
        }
        
        # peaks가 비어있거나 너무 적으면 처리하지 않음
        if not peaks or len(peaks) <= 1:
            return trend_lines
        
        existing_lines = []  # 중복 방지용
        
        def is_similar_line(slope1, y1, slope2, y2, tolerance=0.05):
            slope_similar = abs(slope1 - slope2) / (abs(slope1) + 1e-6) < tolerance
            y_similar = abs(y1 - y2) / (abs(y1) + 1e-6) < tolerance
            return slope_similar and y_similar
        
        def draw_trendline_with_parallel(x1, y1, x2, y2, wave_low_x, wave_low_y):
            # 추세선의 기울기와 y값 계산
            slope = (y2 - y1) / (x2 - x1)
            y_mid = (y1 + y2) / 2
            
            # 비슷한 선이 있는지 확인
            for existing_slope, existing_y in existing_lines:
                if is_similar_line(slope, y_mid, existing_slope, existing_y, tolerance=0.1):
                    return
            
            existing_lines.append((slope, y_mid))
            
            # 추세선 정보 저장
            trend_lines["trends"].append({
                "start": (x1, y1),
                "end": (x2, y2),
                "slope": slope
            })
            
            # 평행선 정보 저장
            parallel_intercept = wave_low_y - slope * wave_low_x
            trend_lines["parallels"].append({
                "start": (wave_low_x, wave_low_y),
                "slope": slope,
                "intercept": parallel_intercept
            })
        
        # 최근 고점들만 사용 (최대 6개)
        recent_peaks = peaks[-6:]
        recent_waves = waves[-6:]
        
        try:
            for i in range(len(recent_peaks) - 1):
                current_peak = recent_peaks[i]
                next_peak = recent_peaks[i+1]
                
                # peaks 데이터 구조 확인 및 안전한 접근
                current_price = current_peak[1] if isinstance(current_peak, tuple) else current_peak['price']
                next_price = next_peak[1] if isinstance(next_peak, tuple) else next_peak['price']
                
                # 다음 고점이 현재 고점보다 높을 때
                if next_price > current_price:
                    price_diff_percent = (next_price - current_price) / current_price * 100
                    
                    if price_diff_percent >= 50:
                        # 가장 가까운 과거 고점 찾기
                        all_previous_peaks = recent_peaks[:i+1]
                        closest_peak = min(all_previous_peaks, 
                                         key=lambda x: abs((x[1] if isinstance(x, tuple) else x['price']) - next_price))
                        
                        draw_trendline_with_parallel(
                            closest_peak[0] if isinstance(closest_peak, tuple) else closest_peak['index'],
                            closest_peak[1] if isinstance(closest_peak, tuple) else closest_peak['price'],
                            next_peak[0] if isinstance(next_peak, tuple) else next_peak['index'],
                            next_price,
                            recent_waves[i+1]['Wave_Low_Index'],
                            recent_waves[i+1]['Wave_Low']
                        )
                        continue
                
                # 일반적인 경우
                draw_trendline_with_parallel(
                    current_peak[0] if isinstance(current_peak, tuple) else current_peak['index'],
                    current_price,
                    next_peak[0] if isinstance(next_peak, tuple) else next_peak['index'],
                    next_price,
                    recent_waves[i+1]['Wave_Low_Index'],
                    recent_waves[i+1]['Wave_Low']
                )
        except Exception as e:
            print(f"Error in generate_trend_lines: {str(e)}")
            import traceback
            print(traceback.format_exc())
        
        return trend_lines
