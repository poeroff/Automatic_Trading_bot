from datetime import datetime, timedelta
import re
import sys
from PyQt5.QAxContainer import *
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from pykiwoom.kiwoom import Kiwoom
import pandas as pd
import time 


class KiwoomAPI:
    def __init__(self,kiwoom):
      self.kiwoom = kiwoom


    #코스피
    def All_Stock_Data(self):
        # 코스피 종목 코드 가져오기
        kospi_codes = self.kiwoom.GetCodeListByMarket('0')  # 0: 코스피
   
        # 코스닥 종목 코드 가져오기
        kosdaq_codes = self.kiwoom.GetCodeListByMarket('10')  # 10: 코스닥

        # 숫자로만 구성된 코드만 필터링
        kospi_codes = [code for code in kospi_codes if code.isdigit()]
        kosdaq_codes = [code for code in kosdaq_codes if code.isdigit()]

        all_codes = kospi_codes + kosdaq_codes
        stock_codes = {}  # 종목코드와 종목명을 저장할 딕셔너리

        for code in all_codes:
            stock_name = self.kiwoom.GetMasterCodeName(code)
            
            exclude_keywords = [
                'ETF', 'ETN', '선물', 
                'KODEX', 'TIGER', 'KBSTAR',
                'SOL', 'ACE',"VITA",
                'HANARO', 'KOSEF', 'KINDEX', 
                'ARIRANG', 'SMART', 'FOCUS',
                'TIMEFOLIO', 'WOORI',
                '우B', '우C', 
                '레버리지', '인버스',
                'KoAct', '채권', "스팩","PLUS",
                "RISE","KIWOOM","BNK","WON",
                "마이다스","에셋플러스","KCGI","리츠","액티브"
            ]
            
            # 단순히 in 연산자로 체크
            if not any(keyword in stock_name for keyword in exclude_keywords) and not re.search(r'\d', stock_name):
                stock_codes[code] = stock_name  # 종목코드와 종목명을 딕셔너리에 저장

        return stock_codes  # 종목코드와 종목명을 포함한 딕셔너리 반환
    


    def Stock_Data(self, code, set_d):
        df_list = []
        total_rows = 0
        
        # 첫 번째 일봉 데이터 요청
        df_firstblock = self.kiwoom.block_request(
                "opt10082",
                종목코드=code,
                기준일자=set_d,
                수정주가구분=1,
                output="주식주봉차트조회",
                next=0
        )
        time.sleep(3.6)
        
        if len(df_firstblock) == 0:
            return pd.DataFrame()
        
        df_list.append(df_firstblock)
        total_rows += len(df_firstblock)
        
        # 모든 일봉 데이터 수집
        while self.kiwoom.tr_remained:
            df_nextblock = self.kiwoom.block_request(
                "opt10082",
                종목코드=code,
                기준일자=set_d,
                수정주가구분=1,
                output="주식주봉차트조회",
                next=2
            )
            time.sleep(3.6)
            
            if len(df_nextblock) == 0:
                break
            
            df_list.append(df_nextblock)
            total_rows += len(df_nextblock)
        
        final_df = pd.concat(df_list)
        final_df = final_df.reset_index(drop=True)
        
        return final_df


    def get_weekly_data(self, code, set_d):
        """주봉 데이터 조회"""
        df_list = []
        max_weeks = 52 * 30  # 30년치
        total_rows = 0
        
        # 첫 번째 주봉 데이터 요청
        df_firstblock = self.kiwoom.block_request(
            "opt10082",
            종목코드=code,
            기준일자=set_d,
            수정주가구분=1,
            output="주식주봉차트조회",
            next=0
        )
        time.sleep(3.6)
        
        if len(df_firstblock) == 0:
            return pd.DataFrame()
            
        df_list.append(df_firstblock)
        total_rows += len(df_firstblock)
        
        # 연속 조회 (주봉)
        while self.kiwoom.tr_remained and total_rows < max_weeks:
            df_nextblock = self.kiwoom.block_request(
                "opt10082",
                종목코드=code,
                기준일자=set_d,
                수정주가구분=1,
                output="주식주봉차트조회",
                next=2
            )
            time.sleep(3.6)
            
            if len(df_nextblock) == 0:
                break
                
            df_list.append(df_nextblock)
            total_rows += len(df_nextblock)
            
            if total_rows >= max_weeks:
                break
        
        final_df = pd.concat(df_list)
        final_df = final_df.reset_index(drop=True)
        
        if len(final_df) > max_weeks:
            final_df = final_df.iloc[:max_weeks]
        
        return final_df


    def get_stock_data(self,Tr_code):
       
        
        set_d = (datetime.now() - timedelta(days=1)).strftime("%Y%m%d")
       
        df = self.Stock_Data(Tr_code, set_d)
        df = pd.DataFrame(df)
        df = df.sort_index(ascending=False).reset_index(drop=True)

        # 필요한 컬럼만 선택
        df = df[['일자','시가', '고가', '저가', '현재가', '거래량']]

        # 데이터 타입 변환
        df = df.astype({
            '일자': str,  # 일자는 문자열로 유지
            '시가': float,
            '고가': float,
            '저가': float,
            '현재가': float,
            '거래량': float
        })

        # 영문으로 컬럼명 변경
        df.columns = ["Date", 'Open', 'High', 'Low', 'Close', 'Volume']
    
        return df
    
    def get_stock_data_all(self, Tr_code):
        set_d = (datetime.now() - timedelta(days=1)).strftime("%Y%m%d")

        all_stock_data = {}
        total_codes = len(Tr_code)

        for idx, code in enumerate(Tr_code, 1):
            print(f"\n[{idx}/{total_codes}] 종목 코드 {code} 데이터 조회 중...")
            df_list = []
            total_rows = 0

            # 첫 번째 블록 요청
            df_firstblock = self.kiwoom.block_request(
                    "opt10082",
                    종목코드=code,
                    기준일자=set_d,
                    수정주가구분=1,
                    output="주식주봉차트조회",
                    next=0
            )
            time.sleep(3.6)

            # 데이터가 있는지 확인
            if len(df_firstblock) == 0:
                print(f"[{idx}/{total_codes}] 종목 코드 {code} - 데이터 없음")
                continue  # 데이터가 없으면 다음 종목으로

            df_list.append(df_firstblock)
            total_rows += len(df_firstblock)

            # 연속 조회
            while self.kiwoom.tr_remained:
                df_nextblock = self.kiwoom.block_request(
                    "opt10082",
                    종목코드=code,
                    기준일자=set_d,
                    수정주가구분=1,
                    output="주식주봉차트조회",
                    next=2
                )

                time.sleep(3.6)

                if len(df_nextblock) == 0:
                    break

                df_list.append(df_nextblock)
                total_rows += len(df_nextblock)

            # 각 종목별 데이터프레임 처리
            final_df = pd.concat(df_list)
            final_df = final_df.reset_index(drop=True)

            try:
                df = pd.DataFrame(final_df)
                
                if df.empty:
                    print(f"종목 코드 {code}에 대한 데이터가 없습니다.")
                    continue  # 다음 종목으로 넘어가기

                df = df.sort_index(ascending=False).reset_index(drop=True)
                
                # 필요한 컬럼이 있는지 확인
                required_columns = ['일자', '시가', '고가', '저가', '현재가', '거래량']
                if not all(col in df.columns for col in required_columns):
                    print(f"종목 코드 {code}에 필요한 컬럼이 없습니다.")
                    continue  # 다음 종목으로 넘어가기

                df = df[required_columns]

                # 데이터 타입 변환
                try:
                    df = df.astype({
                        '일자': str,
                        '시가': float,
                        '고가': float,
                        '저가': float,
                        '현재가': float,
                        '거래량': float
                    })
                except ValueError as e:
                    print(f"종목 코드 {code}의 데이터 타입 변환 중 에러 발생: {str(e)}")
                    continue  # 다음 종목으로 넘어가기

                df.columns = ["Date", 'Open', 'High', 'Low', 'Close', 'Volume']

                # 딕셔너리에 저장
                all_stock_data[code] = df

            except Exception as e:
                print(f"종목 코드 {code} 처리 중 에러 발생: {str(e)}")

        return all_stock_data




