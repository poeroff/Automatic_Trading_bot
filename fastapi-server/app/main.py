import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
import uvicorn
from app.routers import schedule
from app.database import create_db_pool, close_db_pool
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from pytz import timezone
import logging
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 스케줄러 설정 (이벤트 루프 명시)
async_scheduler = AsyncIOScheduler(event_loop=asyncio.get_event_loop(), timezone=timezone('Asia/Seoul'))

# 실제 작업
@async_scheduler.scheduled_job('cron', hour=0, minute=29)
async def async_DayFindFeakUpdate():
    logger.info(f"Scheduled job started at {datetime.now(timezone('Asia/Seoul'))}: HELLO")
    try:
        db_pool = app.state.db_pool
        await schedule.day_find_freak_update_logic(db_pool)
    except asyncio.CancelledError:
        logger.info("Scheduled job cancelled, cleaning up...")
    except Exception as e:
        logger.error(f"Error in scheduled job: {e}")



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

app = FastAPI(lifespan=lifespan)
app.include_router(schedule.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, log_level="info")  # 모듈 경로 수정