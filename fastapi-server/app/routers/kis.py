# fastapi-server/app/routers/kis.py

from fastapi import APIRouter, HTTPException
from ..services import kis_service  # KIS API 로직이 담긴 서비스 파일 임포트

# API 경로를 그룹화하기 위한 라우터 생성
router = APIRouter(
    prefix="/kis",  # 이 파일의 모든 API 주소는 "/kis"로 시작합니다.
    tags=["Korea Investment API"]  # API 자동 문서에 표시될 그룹 이름
)

@router.get("/stocks/all", summary="KIS API로 전체 주식 종목 조회")
async def get_all_stocks_from_kis():
    """
    한국투자증권 API를 호출하여 KOSPI, KOSDAQ 등 전체 상장 주식 목록을 가져옵니다.
    """
    try:
        # kis_service.py에 있는 함수를 호출하여 실제 작업을 수행합니다.
        stock_list = await kis_service.get_all_stock_list()

        if stock_list is None:
            # 서비스 함수에서 토큰 발급 등에 실패하면 None을 반환할 수 있습니다.
            raise HTTPException(status_code=500, detail="KIS API 토큰 발급 또는 데이터 조회에 실패했습니다.")
        
        # 성공 시, 종목 개수와 데이터 목록을 함께 반환합니다.
        return {"count": len(stock_list), "data": stock_list}

    except Exception as e:
        # 그 외 예상치 못한 오류 발생 시 처리
        raise HTTPException(status_code=500, detail=f"API 호출 중 서버 오류 발생: {e}")