from fastapi import FastAPI
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.routers import schedule
from app.database import create_db_pool, close_db_pool

async_scheduler = AsyncIOScheduler()


@async_scheduler.scheduled_job('cron', hour=19, minute=44)
async def async_DayFindFeakUpdate():
    # 여기서는 request가 없으므로, 직접 app.state.db_pool을 사용해야 함
    db_pool = app.state.db_pool
    await schedule.day_find_freak_update_logic(db_pool)  # 로직 함수 직접 호출


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... Connecting to DB")
    # DB 풀 생성
    app.state.db_pool = await create_db_pool()

    # 스케줄러 시작
    async_scheduler.start()

    yield  # --- 애플리케이션 구동 중 ---

    print("Shutting down... Closing DB connection")
    # 스케줄러 종료
    async_scheduler.shutdown()

    # DB 풀 닫기
    await close_db_pool(app.state.db_pool)


# FastAPI 인스턴스 생성 (lifespan 바인딩)
app = FastAPI(lifespan=lifespan)
app.include_router(schedule.router)
