import asyncio
import websockets
import json

async def receive_message(websocket):
    async for message in websocket:
        try:
            data = json.loads(message)
            if "text" in data:
                print(f"📝 받은 텍스트: {data['text']}")
        except json.JSONDecodeError:
            print("❌ JSON 디코딩 오류")

async def main():
    async with websockets.serve(receive_message, "0.0.0.0", 8000):
        print("🚀 WebSocket 서버가 실행 중 (ws://localhost:8000)")
        await asyncio.Future()  # 무한 루프 유지

if __name__ == "__main__":
    asyncio.run(main())
