# fastapi-server/app/schemas/news.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# === 주식(Stock) 관련 데이터 모양 정의 ===

# API를 통해 새로운 주식을 생성할 때 받을 데이터의 모양
class StockCreate(BaseModel):
    ticker: str
    name: str
    market: Optional[str] = None # market 정보는 없어도 괜찮음

# API가 데이터베이스에서 조회한 주식 정보를 응답으로 보낼 때의 모양
class Stock(StockCreate):
    id: int # DB에 저장된 후 생성되는 고유 ID 포함

    # Pydantic v2 이상에서는 orm_mode 대신 from_attributes를 사용
    class Config:
        from_attributes = True


# === AI 분석(Analysis) 관련 데이터 모양 정의 (향후 사용) ===

class ArticleAnalysis(BaseModel):
    summary: Optional[str] = None
    sentiment: Optional[str] = None # 예: 'POSITIVE', 'NEGATIVE', 'NEUTRAL'
    keywords: Optional[List[str]] = None

    class Config:
        from_attributes = True


# === 뉴스 기사(News Article) 관련 데이터 모양 정의 (향후 사용) ===

class NewsArticle(BaseModel):
    id: int
    title: str
    url: str
    source: Optional[str] = None
    published_at: Optional[datetime] = None
    # 뉴스 정보와 함께 분석 결과를 한번에 보여주기 위해 중첩 구조 사용
    analysis: Optional[ArticleAnalysis] = None

    class Config:
        from_attributes = True