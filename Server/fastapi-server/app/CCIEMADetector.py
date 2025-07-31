import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

class CCIEMAStochRSIDetector:
    """CCI+EMA+StochRSI 기반 매매 신호 감지기"""
    
    def __init__(self, cci_length=20, ema_length=13, rsi_length=14, stoch_length=14, 
                 k_smooth=3, d_smooth=3, buy_threshold=-150, stoch_rsi_threshold=50,
                 sell_threshold_cci_ema=100, sell_threshold_cci=150, stop_loss_threshold=-175):
        self.cci_length = cci_length
        self.ema_length = ema_length
        self.rsi_length = rsi_length
        self.stoch_length = stoch_length
        self.k_smooth = k_smooth
        self.d_smooth = d_smooth
        self.buy_threshold = buy_threshold
        self.stoch_rsi_threshold = stoch_rsi_threshold
        self.sell_threshold_cci_ema = sell_threshold_cci_ema
        self.sell_threshold_cci = sell_threshold_cci
        self.stop_loss_threshold = stop_loss_threshold
    
    def calculate_cci(self, df):
        """CCI(Commodity Channel Index) 계산 - Pine Script와 동일한 방식"""
        try:
            # Pine Script처럼 close price 사용
            src = df['close']
            
            # SMA 계산
            sma = src.rolling(window=self.cci_length).mean()
            
            # Mean Deviation 계산 (Pine Script의 ta.dev와 동일)
            def mean_deviation(series, window):
                return series.rolling(window=window).apply(
                    lambda x: np.mean(np.abs(x - x.mean())), raw=True
                )
            
            mad = mean_deviation(src, self.cci_length)
            
            # CCI 계산: (Source - SMA) / (0.015 * Mean Deviation)
            cci = (src - sma) / (0.015 * mad)
            
            return cci.fillna(0)
            
        except Exception as e:
            logger.error(f"CCI 계산 중 오류: {e}")
            return pd.Series([0] * len(df), index=df.index)
    
    def calculate_rsi(self, series, period):
        """RSI(Relative Strength Index) 계산"""
        try:
            delta = series.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi.fillna(50)
        except Exception as e:
            logger.error(f"RSI 계산 중 오류: {e}")
            return pd.Series([50] * len(series), index=series.index)
    
    def calculate_stochastic_rsi(self, df):
        """Stochastic RSI 계산 - Pine Script와 동일한 방식"""
        try:
            # RSI 계산
            rsi = self.calculate_rsi(df['close'], self.rsi_length)
            
            # Stochastic 계산 (RSI에 대해)
            rsi_min = rsi.rolling(window=self.stoch_length).min()
            rsi_max = rsi.rolling(window=self.stoch_length).max()
            
            stoch_rsi = 100 * (rsi - rsi_min) / (rsi_max - rsi_min)
            stoch_rsi = stoch_rsi.fillna(50)
            
            # K와 D 라인 계산 (스무딩)
            k = stoch_rsi.rolling(window=self.k_smooth).mean()
            d = k.rolling(window=self.d_smooth).mean()
            
            return k.fillna(50), d.fillna(50)
            
        except Exception as e:
            logger.error(f"Stochastic RSI 계산 중 오류: {e}")
            return (pd.Series([50] * len(df), index=df.index), 
                    pd.Series([50] * len(df), index=df.index))
    
    def calculate_ema(self, series, period):
        """지수이동평균(EMA) 계산"""
        try:
            return series.ewm(span=period, adjust=False).mean()
        except Exception as e:
            logger.error(f"EMA 계산 중 오류: {e}")
            return pd.Series([0] * len(series), index=series.index)
    
    def calculate_cci_ema_stochrsi_signal(self, df):
        """CCI+EMA+StochRSI 매매 신호 계산 - Pine Script 로직과 동일"""
        try:
            # 필요한 컬럼 확인
            required_columns = ['high', 'low', 'close']
            if not all(col in df.columns for col in required_columns):
                logger.error(f"필요한 컬럼이 없습니다: {required_columns}")
                return None
            
            # 충분한 데이터가 있는지 확인
            min_required_data = max(self.cci_length, self.ema_length, self.rsi_length, self.stoch_length) + 20
            if len(df) < min_required_data:
                logger.warning(f"데이터가 부족합니다. 최소 {min_required_data}개 필요, 현재 {len(df)}개")
                return None
            
            # 데이터 복사 및 정렬
            df_work = df.copy().sort_index()
            
            # CCI 계산 (파란색 선)
            df_work['cci'] = self.calculate_cci(df_work)
            
            # CCI+EMA 계산 (노란색 선)
            df_work['cci_ema'] = self.calculate_ema(df_work['cci'], self.ema_length)
            
            # Stochastic RSI 계산
            df_work['stoch_rsi_k'], df_work['stoch_rsi_d'] = self.calculate_stochastic_rsi(df_work)
            
            # 매매 신호 계산
            df_work['buy_signal'] = False
            df_work['sell_signal'] = False
            df_work['stop_loss_signal'] = False
            df_work['sell_reason'] = ''
            
            # 매수 신호: CCI+EMA가 -150 이상으로 올라가고 StochRSI가 50 미만일 때
            buy_condition = (
                (df_work['cci_ema'] >= self.buy_threshold) & 
                (df_work['cci_ema'].shift(1) < self.buy_threshold) &
                (df_work['stoch_rsi_k'] < self.stoch_rsi_threshold)
            )
            df_work.loc[buy_condition, 'buy_signal'] = True
            
            # 손절 신호: CCI+EMA가 -175 이하로 떨어질 때
            stop_loss_condition = (
                df_work['cci_ema'] <= self.stop_loss_threshold
            )
            df_work.loc[stop_loss_condition, 'stop_loss_signal'] = True
            
            # 매도 신호 1: CCI+EMA가 100 이상으로 올라갈 때
            sell_condition_cci_ema = (
                (df_work['cci_ema'] >= self.sell_threshold_cci_ema) & 
                (df_work['cci_ema'].shift(1) < self.sell_threshold_cci_ema)
            )
            
            # 매도 신호 2: CCI가 150을 위로 뚫었다가 아래로 떨어질 때 (Pine Script와 동일)
            sell_condition_cci = (
                (df_work['cci'] <= self.sell_threshold_cci) & 
                (df_work['cci'].shift(1) > self.sell_threshold_cci)
            )
            
            # 매도 신호 적용
            df_work.loc[sell_condition_cci_ema, 'sell_signal'] = True
            df_work.loc[sell_condition_cci_ema, 'sell_reason'] = 'CCI+EMA 상승'
            
            df_work.loc[sell_condition_cci, 'sell_signal'] = True
            df_work.loc[sell_condition_cci, 'sell_reason'] = 'CCI 하락'
            
            # 최신 데이터 정보
            latest = df_work.iloc[-1]
            current_cci = latest['cci']
            current_cci_ema = latest['cci_ema']
            current_stoch_rsi_k = latest['stoch_rsi_k']
            current_stoch_rsi_d = latest['stoch_rsi_d']
            
            # 현재 상태 판단
            position_status = "대기중"
            if latest['buy_signal']:
                position_status = "매수 신호"
            elif latest['sell_signal']:
                position_status = f"매도 신호 ({latest['sell_reason']})"
            elif latest['stop_loss_signal']:
                position_status = "손절 신호"
            
            # 매수 조건 상세 체크
            buy_condition_details = {
                'cci_ema_above_threshold': current_cci_ema >= self.buy_threshold,
                'cci_ema_crossed_up': len(df_work) > 1 and df_work['cci_ema'].iloc[-2] < self.buy_threshold,
                'stoch_rsi_below_threshold': current_stoch_rsi_k < self.stoch_rsi_threshold
            }
            
            # 결과 반환
            result = {
                'success': True,
                'current_cci': round(current_cci, 2),
                'current_cci_ema': round(current_cci_ema, 2),
                'current_stoch_rsi_k': round(current_stoch_rsi_k, 2),
                'current_stoch_rsi_d': round(current_stoch_rsi_d, 2),
                'latest_buy_signal': latest['buy_signal'],
                'latest_sell_signal': latest['sell_signal'],
                'latest_stop_loss_signal': latest['stop_loss_signal'],
                'sell_reason': latest['sell_reason'],
                'position_status': position_status,
                'buy_condition_details': buy_condition_details,
                'buy_signals_count': df_work['buy_signal'].sum(),
                'sell_signals_count': df_work['sell_signal'].sum(),
                'stop_loss_signals_count': df_work['stop_loss_signal'].sum(),
                'thresholds': {
                    'buy_threshold': self.buy_threshold,
                    'stoch_rsi_threshold': self.stoch_rsi_threshold,
                    'sell_threshold_cci_ema': self.sell_threshold_cci_ema,
                    'sell_threshold_cci': self.sell_threshold_cci,
                    'stop_loss_threshold': self.stop_loss_threshold
                },
                'signals_data': df_work[['cci', 'cci_ema', 'stoch_rsi_k', 'stoch_rsi_d', 'buy_signal', 'sell_signal', 'stop_loss_signal', 'sell_reason']].tail(10)
            }
            
            logger.info(f"CCI+EMA+StochRSI 신호 계산 완료 - CCI: {current_cci:.2f}, CCI+EMA: {current_cci_ema:.2f}, StochRSI: {current_stoch_rsi_k:.2f}, 상태: {position_status}")
            return result
            
        except Exception as e:
            logger.error(f"CCI+EMA+StochRSI 신호 계산 중 오류: {e}")
            return {
                'success': False,
                'error': str(e),
                'current_cci': 0,
                'current_cci_ema': 0,
                'current_stoch_rsi_k': 0,
                'current_stoch_rsi_d': 0,
                'latest_buy_signal': False,
                'latest_sell_signal': False,
                'latest_stop_loss_signal': False
            }