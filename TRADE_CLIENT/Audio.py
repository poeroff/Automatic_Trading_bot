import asyncio
import json
import websockets
import whisper
import numpy as np
import io
import base64
import wave
import tempfile
import os
import time
from concurrent.futures import ThreadPoolExecutor
import soundfile as sf

# 스레드 풀 생성
executor = ThreadPoolExecutor(max_workers=1)

# WebSocket 연결 관리
connections = {}

# Whisper 모델 로드 (base 모델 사용하여 속도 향상)
print("Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("Whisper model loaded")

async def transcribe_audio(audio_data):
    """Whisper를 사용하여 실시간으로 오디오 변환"""
    try:
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_path = temp_file.name
            
            # WAV 파일로 변환
            with wave.open(temp_path, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(16000)  # Whisper가 선호하는 샘플링 레이트
                wf.writeframes(audio_data)
            
            # 오디오 데이터 로드
            audio_array, samplerate = sf.read(temp_path)
            
            # 16kHz로 변환하여 새로운 임시 파일 생성
            resampled_path = temp_path + "_resampled.wav"
            sf.write(resampled_path, audio_array, 16000)
            
            print(f"🔍 Processing {len(audio_data)} bytes of audio...")

            # 별도 스레드에서 Whisper 모델 실행
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(executor, whisper_model.transcribe, resampled_path)
            
            # 임시 파일 삭제
            try:
                os.unlink(temp_path)
                os.unlink(resampled_path)
            except:
                pass

            # 결과 반환
            if result and 'text' in result:
                text = result['text'].strip()
                if text:
                    print(f"🎤 Recognized: {text}")
                    return text
    except Exception as e:
        print(f"❌ Error processing audio: {str(e)}")
    
    return None

async def signaling_server(websocket):
    """WebSocket 연결 관리 및 메시지 처리"""
    client_id = id(websocket)
    connections[client_id] = websocket
    print(f"🔗 New WebSocket connection: {client_id}")
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                
                if "audio" in data:
                    # 오디오 데이터 수신
                    audio_data = base64.b64decode(data["audio"])
                    print(f"🎙️ Received {len(audio_data)} bytes of audio")

                    # Whisper로 실시간 변환
                    text = await transcribe_audio(audio_data)

                    if text:
                        # 변환된 텍스트를 클라이언트로 전송
                        await websocket.send(json.dumps({"transcript": text}))
            
            except json.JSONDecodeError:
                print("❌ Received invalid JSON data")
                
    except websockets.exceptions.ConnectionClosed:
        print(f"⚠️ Connection closed: {client_id}")
    finally:
        if client_id in connections:
            del connections[client_id]

async def main():
    server = await websockets.serve(signaling_server, "0.0.0.0", 8000)
    print("🚀 WebRTC Signaling Server running on ws://localhost:8000")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
