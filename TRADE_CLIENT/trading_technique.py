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
    
    def get_resistance_price(self,peaks, n, current_idx):
        if n == len(peaks) - 1:
            current_peak = peaks[n-1]  # 이전 고점
            next_peak = peaks[n]      # 현재(마지막) 고점
        else:
            current_peak = peaks[n]    # 현재 고점
            next_peak = peaks[n + 1]   # 다음 고점
                    # 같은 x 좌표를 가진 피크 처리
        if next_peak[0] - current_peak[0] == 0:
            return 0
        # 기울기 계산
        slope = (next_peak[1] - current_peak[1]) / (next_peak[0] - current_peak[0])
        
        # y절편 계산
        intercept = current_peak[1] - slope * current_peak[0]
        
        # 현재 x좌표에서의 저항선 가격 계산
        resistance_price = slope * current_idx + intercept
        
        return resistance_price

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
                current_idx = wave_section.index[j]
                current_price = wave_section.iloc[j]
                current_date = pd.Timestamp(dates[current_idx])  # 현재 날짜를 pandas.Timestamp로 변환

                # 1년 이내 조건 확인
                if current_date > peak_date + timedelta(days=365):
                    break  # 1년이 넘으면 더 이상 검사하지 않음
           
              
                resistance_price = self.get_resistance_price(peaks, i, current_idx)

                if current_price < current_min:
                    current_min = current_price
                    min_idx = wave_section.index[j]
                    continue  # 새로운 최저점을 찾았으므로 다음 반복으로
                

                # 현재 가격의 반등 비율 계산
                rebound_ratio = (current_price - current_min) / current_min
              
                # 10~17% 사이의 반등이고, 지금까지 찾은 것보다 더 큰 반등이면 저장
                if rebound_ratio > max_rebound:

                    # 저항선 가격 계산
                    resistance_price = self.get_resistance_price(peaks, i, min_idx)  # 최저점에서의 저항선 가격

                    # 최저점이 저항선보다 낮고
                    if current_min < resistance_price:  # 최저점이 저항선보다 낮은지 먼저 확인
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


    def generate_trend_lines(self,df, peaks, waves):
        trend_lines = {
            "trends": [],      # 주요 추세선
            "parallels": []    # 평행선
        }
        
        existing_lines = []  # 중복 방지용
        
        def is_similar_line(slope1, y1, slope2, y2, tolerance=0.05):
            """두 선이 비슷한지 확인하는 함수에 가격 차이 비교 로직 추가"""
            slope_similar = abs(slope1 - slope2) / (abs(slope1) + 1e-6) < tolerance
            
            # 가격 차이를 비율로 계산
            price_diff_ratio = abs(y1 - y2) / ((y1 + y2) / 2)
            price_similar = price_diff_ratio < 0.10  # 15% 이내의 가격 차이는 비슷한 것으로 간주
            
            return slope_similar or price_similar  # 기울기나 가격이 비슷하면 중복으로 처리
        
        def add_trendline_with_parallel(x1, y1, x2, y2, wave_low_x, wave_low_y):
            # 같은 x 좌표를 가진 점 처리
            if x2 - x1 == 0:
                return
            
            slope = (y2 - y1) / (x2 - x1)
            y_mid = (y1 + y2) / 2
            
            # 비슷한 선이 있는지 확인
            for existing_slope, existing_y in existing_lines:
                if is_similar_line(slope, y_mid, existing_slope, existing_y, tolerance=0.5):
                    return
            
            existing_lines.append((slope, y_mid))
            
            # 추세선 정보 저장
            trend_lines["trends"].append({
                "start": (x1, y1),
                "end": (x2, y2),
                "slope": slope
            })
            
            # 평행선 정보 저장
            parallel_slope = slope
            parallel_intercept = wave_low_y - slope * wave_low_x
            trend_lines["parallels"].append({
                "start": (wave_low_x, wave_low_y),
                "slope": parallel_slope,
                "intercept": parallel_intercept
            })
        
        # 최근 고점들만 사용
        recent_peaks = peaks[:]
        recent_waves = waves[:]
        
        for i in range(len(recent_peaks) - 1):
            current_peak = recent_peaks[i]
            next_peak = recent_peaks[i+1]

            # 같은 x 좌표를 가진 피크 처리
            if next_peak[0] - current_peak[0] == 0:
                continue

            # 현재 고점과 다음 고점 사이의 기울기 계산
            x_range = df['High'].index.max() - df['High'].index.min()
            y_range = df['High'].max() - df['High'].min()
            
            # 스케일 조정된 기울기 계산
            dx = (next_peak[0] - current_peak[0]) / x_range * 100
            dy = (next_peak[1] - current_peak[1]) / y_range * 100
            slope = dy / dx * 100
            
            # 기울기가 140 이상인 경우
            if slope > 140:
                all_previous_peaks = recent_peaks[:i+1]
                highest_valid_peak = None
                highest_price = 0
                
                for prev_peak in all_previous_peaks:
                    new_slope = (next_peak[1] - prev_peak[1]) / (next_peak[0] - prev_peak[0])
                    if new_slope <= 140 and prev_peak[1] > highest_price:
                        # 선이 가격을 가로지르는지 확인
                        if not self.does_line_cross_price(df, prev_peak[0], prev_peak[1], 
                                                next_peak[0], next_peak[1]):
                            highest_price = prev_peak[1]
                            highest_valid_peak = prev_peak
                
                # 조건을 만족하는 과거 고점을 찾은 경우
                if highest_valid_peak:
                    add_trendline_with_parallel(highest_valid_peak[0], highest_valid_peak[1],
                                            next_peak[0], next_peak[1],
                                            recent_waves[i+1]['Wave_Low_Index'],
                                            recent_waves[i+1]['Wave_Low'])
                continue
                
            # 음의 기울기인 경우
            if slope < 0:
                future_peaks = recent_peaks[i+1:]
                next_peak = recent_peaks[i+1]
                next_slope = (next_peak[1] - current_peak[1]) / (next_peak[0] - current_peak[0])
                
                # 모든 미래 고점들과의 기울기가 next_slope보다 작은지 확인
                all_slopes_smaller = True
                for future_peak in future_peaks:
                    new_slope = (future_peak[1] - current_peak[1]) / (future_peak[0] - current_peak[0])
                    if new_slope > next_slope:
                        # 선이 가격을 가로지르는지 확인
                        if not self.does_line_cross_price(df, current_peak[0], current_peak[1], 
                                                future_peak[0], future_peak[1]):
                            all_slopes_smaller = False
                            break
                
                if all_slopes_smaller:
                    continue
                
                valid_peak = None
                min_positive_slope = float('inf')
                min_negative_slope = float('-inf')
                positive_peak = None
                negative_peak = None
                
                for future_peak in future_peaks:
                    new_slope = (future_peak[1] - current_peak[1]) / (future_peak[0] - current_peak[0])
                    # 선이 가격을 가로지르지 않는 경우에만 고려
                    if not self.does_line_cross_price(df, current_peak[0], current_peak[1], 
                                            future_peak[0], future_peak[1]):
                        if 0 <= new_slope <= 140:
                            if new_slope < min_positive_slope:
                                min_positive_slope = new_slope
                                positive_peak = future_peak
                        elif new_slope > min_negative_slope:
                            min_negative_slope = new_slope
                            negative_peak = future_peak
                
                valid_peak = positive_peak if positive_peak else negative_peak
                
                if valid_peak:
                    valid_peak_idx = next(idx for idx, peak in enumerate(recent_peaks) if peak[0] == valid_peak[0])
                    add_trendline_with_parallel(current_peak[0], current_peak[1],
                                            valid_peak[0], valid_peak[1],
                                            recent_waves[valid_peak_idx]['Wave_Low_Index'],
                                            recent_waves[valid_peak_idx]['Wave_Low'])
                continue
            
            # 그 외의 경우: 인접한 고점끼리 연결
            add_trendline_with_parallel(current_peak[0], current_peak[1],
                                    next_peak[0], next_peak[1],
                                    recent_waves[i+1]['Wave_Low_Index'],
                                    recent_waves[i+1]['Wave_Low'])
            

        print(trend_lines)
        return trend_lines

    def does_line_cross_price(self, df, x1, y1, x2, y2):
        """두 점을 잇는 선이 그 사이의 가격을 가로지르는지 확인"""
        if x1 >= x2 or x2 - x1 == 0:  # x 좌표가 같은 경우도 체크
            return True
        
        # 선의 방정식 계수
        slope = (y2 - y1) / (x2 - x1)
        intercept = y1 - slope * x1
        
        # 두 점 사이의 모든 가격 데이터 확인
        for x in range(x1 + 1, x2):
            line_y = slope * x + intercept  # 선 위의 y값
            price = df.iloc[x]['High']      # 해당 시점의 가격
            
            # 선이 가격을 가로지르는지 확인
            if line_y < price:
                return True
        
        return False
