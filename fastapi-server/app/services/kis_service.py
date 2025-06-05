# fastapi-server/app/services/kis_service.py


import httpx
from decouple import config
import json

# 한국투자증권 API 기본 URL 
KIS_BASE_URL = "https://openapivts.koreainvestment.com:29443"

# 발급받은 접근 토큰을 임시 저장하는 변수
_access_token = None

async def get_kis_access_token():
    """한국투자증권 API 접근 토큰을 발급받습니다."""
    global _access_token

    headers = {"content-type": "application/json"}
    body = {
        "grant_type": "client_credentials",
        "appkey": config("appkey"),
        "appsecret": config("appsecret")
    }
    
    token_url = f"{KIS_BASE_URL}/oauth2/tokenP"
    
    async with httpx.AsyncClient() as client:
        res = await client.post(token_url, headers=headers, json=body)
    
    if res.status_code != 200:
        print(f"KIS 토큰 발급 실패: {res.json()}")
        return None

    token_data = res.json()
    _access_token = f"Bearer {token_data['access_token']}"
    print("KIS 접근 토큰 발급 성공 (모의투자 서버)")
    return _access_token


async def get_all_stock_list():
    """한국투자증권 API를 통해 전체 상장 주식 목록을 가져옵니다."""
    token = _access_token or await get_kis_access_token()
    if not token:
        return None
    
    path = "/uapi/domestic-stock/v1/quotations/search-stock-info"
    url = f"{KIS_BASE_URL}{path}"
    
    headers = {
        "content-type": "application/json",
        "authorization": token,
        "appkey": config("appkey"),
        "appsecret": config("appsecret"),
        "tr_id": "CTPF1002R", # 종목 정보 조회 트랜잭션 ID
        "custtype": "P"       # 개인 투자자
    }
    params = {
        "PDAT_SVC_CD": "W",   # 웹 서비스
        "PRCS_DVSN_CD": "0",  # 전체
        "CTX_AREA_FK100": "",
        "CTX_AREA_NK100": ""
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers, params=params)

    if res.status_code != 200:
        print(f"KIS 종목 리스트 조회 실패: {res.json()}")
        return []
    
    result = res.json()
    
    all_stocks = result.get('output1', []) + result.get('output2', [])
    
    print(f"KIS API를 통해 총 {len(all_stocks)}개의 종목 정보 수신 (모의투자 서버)")
    return all_stocks