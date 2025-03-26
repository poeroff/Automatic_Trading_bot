from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from django.utils import timezone

def save_list():
    # 데이터베이스에 데이터를 저장하거나 업데이트하는 로직을 여기에 작성합니다.
    now = datetime.now() - timedelta(days=1)
    print(now)
    # 데이터베이스 쿼리 및 처리 로직

sched = BackgroundScheduler()
sched.add_job(save_list, 'interval', days=1)  # 매일 실행
sched.start()
