from datetime import datetime, timedelta
import sys
from PyQt5.QAxContainer import *
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from pykiwoom.kiwoom import Kiwoom
import pandas as pd
import time as t


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
        # 일반 주식만 필터링
        stock_codes = []
        for code in all_codes:
            stock_name = self.kiwoom.GetMasterCodeName(code)
            exclude_keywords = [
                'ETF', 'ETN', '선물', 
                'KODEX', 'TIGER', 'KBSTAR',
                'SOL', 'ACE',
                'HANARO', 'KOSEF', 'KINDEX', 
                'ARIRANG', 'SMART', 'FOCUS',
                'TIMEFOLIO', 'WOORI',
                '우B', '우C', 
                '레버리지', '인버스',
                'KoAct', '채권', "스팩","PLUS"
            ]
            
            print(f"종목명: {stock_name}")  # 디버깅용 출력
            
            # 단순히 in 연산자로 체크
            if not any(keyword in stock_name for keyword in exclude_keywords):
                stock_codes.append(code)

        return stock_codes
    


    def Stock_Data(self, code, set_d):
        df_list = []
        max_days = 252 * 10  # 11년치로 수정
        total_rows = 0
        
        # 첫 번째 블록 요청
        df_firstblock = self.kiwoom.block_request(
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
        
        # 연속 조회
        while self.kiwoom.tr_remained and total_rows < max_days:
            df_nextblock = self.kiwoom.block_request(
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
        total_codes = len(Tr_code)  # 전체 종목 수

        for idx, code in enumerate(Tr_code, 1):  # enumerate로 인덱스 추가
            print(f"\n[{idx}/{total_codes}] 종목 코드 {code} 데이터 조회 중...")
            df_list = []
            max_days = 252 * 10
            total_rows = 0

            # 첫 번째 블록 요청
            df_firstblock = self.kiwoom.block_request(
                "opt10081",
                종목코드=code,
                기준일자=set_d,
                수정주가구분=1,
                output="주식일봉차트조회",
                next=0
            )
            t.sleep(3.6)
            current_time = datetime.now()
            if current_time.hour == 4 and current_time.minute >= 56:
                print("오전 4시 58분입니다. 10분 동안 대기합니다.")
                t.sleep(600)  # 10분 대기 (600초)

            # 데이터가 있는지 확인
            if len(df_firstblock) == 0:
                print(f"[{idx}/{total_codes}] 종목 코드 {code} - 데이터 없음")
                continue  # 데이터가 없으면 다음 종목으로

            df_list.append(df_firstblock)
            total_rows += len(df_firstblock)

            # 연속 조회
            while self.kiwoom.tr_remained and total_rows < max_days:
                df_nextblock = self.kiwoom.block_request(
                    "opt10081",
                    종목코드=code,
                    기준일자=set_d,
                    수정주가구분=1,
                    output="주식일봉차트조회",
                    next=2
                )

                t.sleep(3.6)

                if len(df_nextblock) == 0:
                    break

                df_list.append(df_nextblock)
                total_rows += len(df_nextblock)

                if total_rows >= max_days:
                    break

            # 각 종목별 데이터프레임 처리
            final_df = pd.concat(df_list)
            final_df = final_df.reset_index(drop=True)

            if len(final_df) > max_days:
                final_df = final_df.iloc[:max_days]  # 10년치만 잘라내기

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



