# 1. 베이스 이미지 (Python 3.10 사용)
FROM python:3.10-slim

# 2. 작업 디렉토리 설정
WORKDIR /app



# 3. 시스템 종속성 설치 (선택 사항)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Seoul  

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 4. Python 종속성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. 애플리케이션 코드 복사
COPY . .

# 6. 포트 노출 (FastAPI 기본 포트: 8000)
EXPOSE 8000

# 7. 애플리케이션 실행 명령어
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "info"]