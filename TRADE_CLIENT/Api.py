import requests
import asyncio
import aiohttp
from kiwoom_api import KiwoomAPI
import time
from datetime import datetime
from itertools import islice


class Api:
    def __init__(self,kiwoom):
        self.kiwoom = KiwoomAPI(kiwoom)
        self.base_url = "http://127.0.0.1:8000"
    
    def chunks(self, data, size=100):
        """데이터를 size 크기만큼 나누어 반환하는 제너레이터"""
        it = iter(data)
        for first in it:
            yield [first] + list(islice(it, size - 1))

    async def Stock_Data(self):
        tr_code = self.kiwoom.All_Stock_Data()
        total_batches = (len(tr_code) + 99) // 100  # 총 배치 수 계산
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/tr_code_collection/",
                    json={'tr_codes': tr_code}
                ) as response:
                    print("서버 응답:", await response.json())
                
                # 100개 단위로 tr_code 처리
                for batch_index, tr_code_batch in enumerate(self.chunks(tr_code, 100), start=1):
                    print(f"처리 중인 배치: {batch_index}/{total_batches}")
                    
                    # 각 배치에 대해 데이터 가져오기
                    all_stock_data = self.kiwoom.get_stock_data_all(tr_code_batch)
                    print("수집된 데이터:", list(all_stock_data.keys()))  # 어떤 종목이 수집되었는지 확인
                    
                    # 각 종목별로 서버에 전송
                    for code, stock_data in all_stock_data.items():
                        await self.process_stock_data(code, stock_data, session)
                    

        except Exception as e:
            print("전송 에러:", str(e))
    
    async def process_stock_data(self, code, stock_data, session):
        try:
            # DataFrame을 리스트로 변환
            data_list = stock_data.to_dict('records')
            
            async with session.post(
                f"{self.base_url}/stock_data_collection/",
                json={
                    'code': code,
                    'data': data_list  # 리스트 형태로 전송
                }
            ) as response:
                result = await response.json()
                print(f"종목 {code} 데이터 전송 결과:", result)
                
        except Exception as e:
            print(f"종목 {code} 처리 중 에러: {str(e)}")


