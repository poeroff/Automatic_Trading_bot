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
import redis.asyncio as redis
from discord.connection import start_discord_bot, stop_discord_bot

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 스케줄러 설정
async_scheduler = AsyncIOScheduler(timezone=timezone('Asia/Seoul'))

# 실제 작업 - 수정된 
@async_scheduler.scheduled_job('cron', hour=12, minute=26)
async def async_DayFindFeakUpdate():
    try:
        logger.info("=== 스케줄 작업 시작 ===")
        db_pool = app.state.db_pool
        redis_client = app.state.redis_client  # Redis 클라이언트 추
        # 두 매개변수 모두 전달
        await schedule.day_find_freak_update_logic(db_pool, redis_client)
        logger.info("=== 스케줄 작업 완료 ===")
    except asyncio.CancelledError:
        logger.info("Scheduled job cancelled, cleaning up...")
    except Exception as e:
        logger.error(f"Error in scheduled job: {e}")

# 실제 작업 - 수정된 
@async_scheduler.scheduled_job('cron', hour=15, minute=15)
async def async_Balance_check():
    try:
        logger.info("=== 스케줄 작업 시작 ===")
        db_pool = app.state.db_pool
        redis_client = app.state.redis_client  # Redis 클라이언트 추
        # 두 매개변수 모두 전달
        await schedule.Balance_check(db_pool, redis_client)
        logger.info("=== 스케줄 작업 완료 ===")
    except asyncio.CancelledError:
        logger.info("Scheduled job cancelled, cleaning up...")
    except Exception as e:
        logger.error(f"Error in scheduled job: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up... Connecting to DB and Redis")
    
    # DB 연결
    app.state.db_pool = await create_db_pool()
    
    # Redis 연결
    app.state.redis_client = redis.Redis(
        host='redis', 
        port=6379, 
        decode_responses=True
    )
    
    # Redis 연결 테스트
    try:
        await app.state.redis_client.ping()
        logger.info("Redis 연결 성공")
    except Exception as e:
        logger.error(f"Redis 연결 실패: {e}")
    
    # Discord 봇 시작
    logger.info("Starting Discord bot...")
    discord_task = asyncio.create_task(start_discord_bot())
    app.state.discord_task = discord_task
    
    logger.info("Starting scheduler...")
    async_scheduler.start()
    logger.info(f"Scheduled jobs: {async_scheduler.get_jobs()}")
    
    try:
        yield
    except KeyboardInterrupt:
        logger.info("Received KeyboardInterrupt, shutting down gracefully...")
    finally:
        logger.info("Shutting down... Closing connections")
        async_scheduler.shutdown(wait=False)
        
        # Discord 봇 종료
        await stop_discord_bot()
        if hasattr(app.state, 'discord_task'):
            app.state.discord_task.cancel()
            
        await app.state.redis_client.aclose()  # Redis 연결 종료 추가
        await close_db_pool(app.state.db_pool)

app = FastAPI(lifespan=lifespan)
app.include_router(schedule.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, log_level="info")