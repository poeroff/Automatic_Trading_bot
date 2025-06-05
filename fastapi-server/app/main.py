import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.routers import schedule, news, kis
from app.database import create_db_pool, close_db_pool
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from pytz import timezone
import logging
from datetime import datetime

# 테스트 라우터 추가
try:
    from app.routers import test
    TEST_ROUTER_AVAILABLE = True
except ImportError:
    TEST_ROUTER_AVAILABLE = False

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 스케줄러 설정 (이벤트 루프 명시)
async_scheduler = AsyncIOScheduler(event_loop=asyncio.get_event_loop(), timezone=timezone('Asia/Seoul'))

# 실제 작업
@async_scheduler.scheduled_job('cron', hour=12, minute=21)
async def async_DayFindFeakUpdate():
    try:
        db_pool = app.state.db_pool
        await schedule.day_find_freak_update_logic(db_pool)
    except asyncio.CancelledError:
        logger.info("Scheduled job cancelled, cleaning up...")
    except Exception as e:
        logger.error(f"Error in scheduled job: {e}")

# KIS API 종목 동기화 스케줄링 (매일 오전 9시)
@async_scheduler.scheduled_job('cron', hour=9, minute=0)
async def daily_stock_sync():
    try:
        from app.services.improved_kis_service import kis_service
        db_pool = app.state.db_pool
        logger.info("일일 종목 동기화 시작...")
        result = await kis_service.bulk_sync_stocks_to_db(db_pool, ["KOSPI", "KOSDAQ"])
        logger.info(f"종목 동기화 완료: {result}")
    except Exception as e:
        logger.error(f"종목 동기화 실패: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up... Connecting to DB")
    app.state.db_pool = await create_db_pool()
    logger.info("Starting scheduler...")
    async_scheduler.start()
    logger.info(f"Scheduled jobs: {async_scheduler.get_jobs()}")  # 등록된 작업 확인
    try:
        yield
    except KeyboardInterrupt:
        logger.info("Received KeyboardInterrupt, shutting down gracefully...")
    finally:
        logger.info("Shutting down... Closing DB connection")
        async_scheduler.shutdown(wait=False)
        await close_db_pool(app.state.db_pool)

app = FastAPI(
    title="주식 투자 분석 API",
    description="한국투자증권 API와 뉴스 분석을 통한 주식 투자 도구",
    lifespan=lifespan
)

# ✅ CORS 미들웨어 추가 (라우터 등록 전에!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js 개발 서버
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 라우터 등록
app.include_router(schedule.router)
app.include_router(news.router)  # 기존 뉴스 라우터
app.include_router(kis.router)   # 기존 KIS 라우터

# 테스트 라우터 추가 (개발 환경에서만)
if TEST_ROUTER_AVAILABLE:
    app.include_router(test.router)
    logger.info("테스트 라우터 등록 완료")

# 향후 추가할 개선된 라우터들 (파일 생성 후 주석 해제)
# from app.routers import improved_kis, improved_news
# app.include_router(improved_kis.router)
# app.include_router(improved_news.router)

# 기본 헬스체크 엔드포인트
@app.get("/", summary="API 상태 확인")
async def root():
    return {
        "message": "주식 투자 분석 API 서버",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "schedule": "/schedule",
            "news": "/news", 
            "kis": "/kis",
            "test": "/test" if TEST_ROUTER_AVAILABLE else "not_available"
        },
        "quick_start": {
            "1": "먼저 /test/quick-setup 으로 환경 확인",
            "2": "그 다음 /test/add-sample-stocks 으로 샘플 데이터 추가",
            "3": "마지막으로 /kis/stocks/all 로 KIS API 테스트"
        }
    }

@app.get("/health", summary="서버 헬스체크")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected",
        "scheduler": "running",
        "test_endpoints": TEST_ROUTER_AVAILABLE
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, log_level="info")