from pykiwoom.kiwoom import Kiwoom
import pandas as pd
import time


class LoginKiwoom:
    def login_kiwoom():
        global kiwoom
        kiwoom = Kiwoom()
        kiwoom.CommConnect(block=True)
        return kiwoom.GetConnectState()



    def test(code, set_d):
        df_list = []
        max_days = 252 * 10  # 약 10년치 거래일 (252일 * 10년)
        total_rows = 0
        # 첫 번째 블록 요청
        df_firstblock = kiwoom.block_request(
            "opt10081",
            종목코드=code,
            기준일자=set_d,
            수정주가구분=1,
            output="주식일봉차트조회",
            next=0
        )
        
        # 데이터가 있는지 확인
        if len(df_firstblock) == 0:
            return pd.DataFrame()
            
        df_list.append(df_firstblock)
        total_rows += len(df_firstblock)
        
        # 연속 조회 (10년치 데이터 제한)
        while kiwoom.tr_remained and total_rows < max_days:
            time.sleep(0.25)  # API 호출 제한 준수
            
            df_nextblock = kiwoom.block_request(
                "opt10081",
                종목코드=code,
                기준일자=set_d,
                수정주가구분=1,
                output="주식일봉차트조회",
                next=2
            )
            
            # 더 이상 데이터가 없으면 중단
            if len(df_nextblock) == 0:
                break
                
            df_list.append(df_nextblock)
            total_rows += len(df_nextblock)
            
            # 10년치 데이터를 넘어가면 중단
            if total_rows >= max_days:
                break
        
        # 모든 데이터프레임 합치기
        final_df = pd.concat(df_list)
        final_df = final_df.reset_index(drop=True)
        
        # 10년치만 잘라내기
        if len(final_df) > max_days:
            final_df = final_df.iloc[:max_days]
        
        return final_df

    # 데이터 가져오기

    def get_stock_data():
        df = LoginKiwoom.test("005930", "20241229")
        df = pd.DataFrame(df)
        df = df.sort_index(ascending=False).reset_index(drop=True)

        # 필요한 컬럼만 선택
        df = df[['시가', '고가', '저가', '현재가', '거래량']]

        # 데이터 타입 변환
        df = df.astype({
            '시가': 'float',
            '고가': 'float',
            '저가': 'float',
            '현재가': 'float',
            '거래량': 'float'
        })

        # 영문으로 컬럼명 변경
        df.columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        return df


