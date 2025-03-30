import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import uvicorn
from app.routers import schedule
from app.database import create_db_pool, close_db_pool

async_scheduler = AsyncIOScheduler()

#대략 23분정도 걸림(변곡점 및 고점 업데이트)
@async_scheduler.scheduled_job('cron', hour=5, minute=15)
async def async_DayFindFeakUpdate():
    try:
        db_pool = app.state.db_pool
        await schedule.day_find_freak_update_logic(db_pool)
    except asyncio.CancelledError:
        print("Scheduled job cancelled, cleaning up...")
    except Exception as e:
        print(f"Error in scheduled job: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... Connecting to DB")
    app.state.db_pool = await create_db_pool()
    async_scheduler.start()

    try:
        yield
    except KeyboardInterrupt:
        print("Received KeyboardInterrupt, shutting down gracefully...")
    finally:
        print("Shutting down... Closing DB connection")
        async_scheduler.shutdown(wait=False)
        await close_db_pool(app.state.db_pool)

app = FastAPI(lifespan=lifespan)
app.include_router(schedule.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")