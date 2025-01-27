from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pykiwoom.kiwoom import *
import uvicorn
import asyncio
import sys
from PyQt5.QtWidgets import *

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PyQt 애플리케이션 인스턴스 생성
qt_app = QApplication(sys.argv)
kiwoom = Kiwoom()

@app.post("/login")
async def login():
    try:
        print("로그인 창을 엽니다.")
        kiwoom.CommConnect(block=False)
        
        while True:
            if kiwoom.GetConnectState():
                print("로그인 성공")
                # 로그인 창 찾아서 닫기
                for widget in qt_app.topLevelWidgets():
                    if widget.windowTitle() == "로그인":
                        widget.close()
                return {"message": "로그인 성공"}
            await asyncio.sleep(1)
            
    except Exception as e:
        print(f"로그인 실패: {str(e)}")
        return {"message": f"로그인 실패: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 