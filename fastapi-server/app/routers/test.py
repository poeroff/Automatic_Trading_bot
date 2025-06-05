# fastapi-server/app/routers/test.py

from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Dict, Any
import aiomysql
from datetime import datetime, timedelta

from ..database import execute_query
from ..services.improved_kis_service import kis_service

router = APIRouter(
    prefix="/test",
    tags=["Test Endpoints"]
)

async def get_db_pool(request: Request) -> aiomysql.Pool:
    return request.app.state.db_pool

@router.get("/kis-token", summary="KIS API 토큰 테스트")
async def test_kis_token():
    """KIS API 토큰 발급을 테스트합니다."""
    try:
        token = await kis_service.get_access_token()
        return {
            "success": token is not None,
            "message": "토큰 발급 성공" if token else "토큰 발급 실패",
            "token_preview": token[:50] + "..." if token else None,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"토큰 테스트 실패: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@router.get("/add-sample-stocks", summary="샘플 종목 DB 추가")
async def add_sample_stocks(pool: aiomysql.Pool = Depends(get_db_pool)):
    """테스트용 샘플 종목을 DB에 추가합니다."""
    sample_stocks = [
        {"ticker": "005930", "name": "삼성전자", "market": "KOSPI"},
        {"ticker": "000660", "name": "SK하이닉스", "market": "KOSPI"},
        {"ticker": "373220", "name": "LG에너지솔루션", "market": "KOSPI"},
        {"ticker": "207940", "name": "삼성바이오로직스", "market": "KOSPI"},
        {"ticker": "005380", "name": "현대차", "market": "KOSPI"},
        {"ticker": "091990", "name": "셀트리온헬스케어", "market": "KOSDAQ"},
        {"ticker": "263750", "name": "펄어비스", "market": "KOSDAQ"},
        {"ticker": "066970", "name": "엘앤에프", "market": "KOSDAQ"}
    ]
    
    added_count = 0
    skipped_count = 0
    
    try:
        for stock in sample_stocks:
            # 중복 확인
            check_query = "SELECT id FROM stocks WHERE ticker = %s"
            existing = await execute_query(check_query, (stock["ticker"],), pool=pool)
            
            if existing:
                skipped_count += 1
                continue
            
            # 새 종목 추가
            insert_query = """
                INSERT INTO stocks (ticker, name, market, created_at, updated_at)
                VALUES (%s, %s, %s, NOW(), NOW())
            """
            await execute_query(insert_query, (stock["ticker"], stock["name"], stock["market"]), pool=pool)
            added_count += 1
        
        return {
            "message": "샘플 종목 추가 완료",
            "added_count": added_count,
            "skipped_count": skipped_count,
            "total_attempted": len(sample_stocks),
            "samples": sample_stocks
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"샘플 종목 추가 실패: {str(e)}")

@router.get("/kis-stock-price/{stock_code}", summary="KIS API 주가 조회 테스트")
async def test_stock_price(stock_code: str):
    """특정 종목의 KIS API 주가 조회를 테스트합니다."""
    try:
        price_data = await kis_service.get_stock_price(stock_code)
        return {
            "success": price_data is not None,
            "stock_code": stock_code,
            "price_data": price_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "stock_code": stock_code,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/db-connection", summary="DB 연결 테스트")
async def test_db_connection(pool: aiomysql.Pool = Depends(get_db_pool)):
    """데이터베이스 연결 상태를 테스트합니다."""
    try:
        # 간단한 쿼리 실행
        result = await execute_query("SELECT NOW() as current_time", pool=pool)
        
        # 종목 테이블 상태 확인
        stocks_count = await execute_query("SELECT COUNT(*) as count FROM stocks", pool=pool)
        
        return {
            "success": True,
            "message": "DB 연결 정상",
            "current_time": result[0]["current_time"] if result else None,
            "stocks_count": stocks_count[0]["count"] if stocks_count else 0,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"DB 연결 실패: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@router.get("/quick-setup", summary="빠른 환경 설정")
async def quick_setup(pool: aiomysql.Pool = Depends(get_db_pool)):
    """개발 환경을 빠르게 설정합니다."""
    setup_results = {}
    
    try:
        # 1. KIS API 토큰 테스트
        try:
            token = await kis_service.get_access_token()
            setup_results["kis_token"] = "성공" if token else "실패"
        except Exception as e:
            setup_results["kis_token"] = f"실패: {str(e)}"
        
        # 2. DB 테이블 상태 확인
        try:
            tables_query = """
                SELECT TABLE_NAME 
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME IN ('stocks', 'news_articles', 'article_analyses')
            """
            tables = await execute_query(tables_query, pool=pool)
            setup_results["required_tables"] = [t["TABLE_NAME"] for t in tables]
        except Exception as e:
            setup_results["required_tables"] = f"확인 실패: {str(e)}"
        
        # 3. 샘플 데이터 확인
        try:
            count_result = await execute_query("SELECT COUNT(*) as count FROM stocks", pool=pool)
            stocks_count = count_result[0]["count"] if count_result else 0
            setup_results["sample_stocks"] = f"{stocks_count}개 종목 등록됨"
        except Exception as e:
            setup_results["sample_stocks"] = f"확인 실패: {str(e)}"
        
        # 4. 전체 상태 평가
        kis_ok = "성공" in setup_results.get("kis_token", "")
        tables_ok = isinstance(setup_results.get("required_tables"), list) and len(setup_results["required_tables"]) >= 2
        
        overall_status = "준비완료" if kis_ok and tables_ok else "설정필요"
        
        return {
            "overall_status": overall_status,
            "setup_results": setup_results,
            "recommendations": [
                "KIS API 토큰이 실패하면 .env 파일의 appkey, appsecret 확인" if not kis_ok else None,
                "필요한 테이블이 없으면 database_schema.sql 실행" if not tables_ok else None,
                "샘플 종목이 없으면 /test/add-sample-stocks 엔드포인트 호출" if stocks_count == 0 else None
            ],
            "next_steps": [
                "1. /test/add-sample-stocks - 샘플 종목 추가",
                "2. /kis/stocks/kospi - KOSPI 종목 조회 테스트", 
                "3. /test/kis-stock-price/005930 - 삼성전자 주가 조회 테스트",
                "4. /kis/sync-stocks-to-db - 전체 종목 DB 동기화"
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "overall_status": "설정오류",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/reset-demo-data", summary="데모 데이터 초기화")
async def reset_demo_data(pool: aiomysql.Pool = Depends(get_db_pool)):
    """데모용 데이터를 초기화합니다. (주의: 기존 데이터 삭제)"""
    try:
        # 기존 데이터 삭제 (외래키 순서 고려)
        await execute_query("DELETE FROM article_analyses", pool=pool)
        await execute_query("DELETE FROM news_articles", pool=pool)
        await execute_query("DELETE FROM stocks", pool=pool)
        
        # 샘플 종목 재추가
        sample_result = await add_sample_stocks(pool)
        
        return {
            "message": "데모 데이터 초기화 완료",
            "deleted_tables": ["article_analyses", "news_articles", "stocks"],
            "sample_stocks_added": sample_result,
            "timestamp": datetime.now().isoformat(),
            "warning": "모든 기존 데이터가 삭제되었습니다."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 초기화 실패: {str(e)}")

@router.get("/environment-info", summary="환경 정보 확인")
async def get_environment_info():
    """현재 실행 환경 정보를 확인합니다."""
    import os
    import sys
    
    return {
        "python_version": sys.version,
        "environment_variables": {
            "DB_HOST": os.getenv("DB_HOST", "not_set"),
            "DB_NAME": os.getenv("DB_NAME", "not_set"),
            "KIS_API_configured": "appkey" in os.environ and "appsecret" in os.environ,
            "GEMINI_API_configured": "GEMINI_API_KEY" in os.environ
        },
        "working_directory": os.getcwd(),
        "timestamp": datetime.now().isoformat()
    }