import asyncio
import websockets
import requests
from bs4 import BeautifulSoup
import json
import time

async def get_stock_data():
    url = "https://finance.naver.com/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    url = "https://finance.naver.com/marketindex/"
    response = requests.get(url)
    soup2 = BeautifulSoup(response.text, "html.parser")
    
    data = {
        "Kospi": {
            "value": soup.select_one("div.kospi_area div.heading_area span.num_quot.up span.num").text,
            "change": soup.select_one("div.kospi_area div.heading_area span.num_quot.up span.num2").text,
            "isPositive": soup.select_one("div.kospi_area div.heading_area span.num_quot.up span.num3").text
        },
        "Kosdaq": {
            "value": soup.select_one("div.kosdaq_area div.heading_area span.num_quot.up span.num").text,
            "change": soup.select_one("div.kosdaq_area div.heading_area span.num_quot.up span.num2").text,
            "isPositive": soup.select_one("div.kosdaq_area div.heading_area span.num_quot.up span.num3").text
        },
        "Kospi200": {
            "value": soup.select_one("div.kospi200_area div.heading_area span.num_quot.up span.num").text,
            "change": soup.select_one("div.kospi200_area div.heading_area span.num_quot.up span.num2").text,
            "isPositive": soup.select_one("div.kospi200_area div.heading_area span.num_quot.up span.num3").text
        },
        "USD": {
            "value": soup2.select_one("div.market1 div.data ul.data_lst li.on a.head.usd div.head_info span.value").text,
            "change": soup2.select_one("div.market1 div.data ul.data_lst li.on a.head.usd div.head_info span.change").text,
            "blind": soup2.select_one("div.market1 div.data ul.data_lst li.on a.head.usd div.head_info span.change + span.blind").text
        },
        "JPY": {
            "value": soup2.select_one("div.market1 div.data ul.data_lst li a.head.jpy div.head_info span.value").text,
            "change": soup2.select_one("div.market1 div.data ul.data_lst li a.head.jpy div.head_info span.change").text,
            "blind": soup2.select_one("div.market1 div.data ul.data_lst li a.head.jpy div.head_info span.change + span.blind").text
        },

        "GOLD": {
            "value": soup2.select_one("div.market3 div.data ul.data_lst li a.head.gold_inter div.head_info span.value").text,
            "change": soup2.select_one("div.market3 div.data ul.data_lst li a.head.gold_inter div.head_info span.change").text,
            "blind": soup2.select_one("div.market3 div.data ul.data_lst li a.head.gold_inter div.head_info span.change + span.blind").text
        }  
    }
    return json.dumps(data)

async def handler(websocket):
    while True:
        try:
            data = await get_stock_data()
            await websocket.send(data)
            await asyncio.sleep(60)  # 1분분마다 데이터 업데이트
        except websockets.exceptions.ConnectionClosed:
            break

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("웹소켓 서버 시작 - ws://localhost:8765")
        await asyncio.Future()  # 서버 계속 실행

if __name__ == "__main__":
    asyncio.run(main())
