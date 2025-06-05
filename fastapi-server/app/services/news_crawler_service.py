# fastapi-server/app/services/news_crawler.py

import asyncio
import aiohttp
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Optional
import urllib.parse
import json

logger = logging.getLogger(__name__)

class NewsWebCrawler:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    async def crawl_naver_news(self, stock_name: str, max_articles: int = 10) -> List[Dict]:
        """네이버 뉴스에서 특정 종목 관련 뉴스 크롤링"""
        try:
            # 검색 쿼리 구성
            query = f"{stock_name} 주식"
            encoded_query = urllib.parse.quote(query)
            
            # 네이버 뉴스 검색 URL
            url = f"https://search.naver.com/search.naver?where=news&sm=tab_jum&query={encoded_query}"
            
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        logger.error(f"네이버 뉴스 요청 실패: {response.status}")
                        return []
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    articles = []
                    news_items = soup.find_all('div', class_='news_wrap')
                    
                    for idx, item in enumerate(news_items[:max_articles]):
                        try:
                            article = await self._parse_naver_news_item(item, stock_name)
                            if article:
                                articles.append(article)
                        except Exception as e:
                            logger.warning(f"뉴스 아이템 파싱 실패: {e}")
                    
                    logger.info(f"{stock_name} 관련 뉴스 {len(articles)}개 수집 완료")
                    return articles
                    
        except Exception as e:
            logger.error(f"네이버 뉴스 크롤링 실패 ({stock_name}): {e}")
            return []
    
    async def _parse_naver_news_item(self, item, stock_name: str) -> Optional[Dict]:
        """개별 뉴스 아이템 파싱"""
        try:
            # 제목 추출
            title_elem = item.find('a', class_='news_tit')
            if not title_elem:
                return None
            
            title = title_elem.get_text(strip=True)
            url = title_elem.get('href', '')
            
            # 요약 내용 추출
            content_elem = item.find('div', class_='news_dsc')
            content = content_elem.get_text(strip=True) if content_elem else ""
            
            # 언론사 추출
            source_elem = item.find('span', class_='info_group')
            source = source_elem.get_text(strip=True) if source_elem else "알 수 없음"
            
            # 날짜 추출 (상대적 시간)
            date_elem = item.find('span', class_='info')
            date_str = date_elem.get_text(strip=True) if date_elem else ""
            
            # 발행시간 처리
            published_at = self._parse_relative_time(date_str)
            
            return {
                "title": title,
                "url": url,
                "content_preview": content[:200] + "..." if len(content) > 200 else content,
                "source": source,
                "published_at": published_at,
                "stock_name": stock_name,
                "crawled_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.warning(f"뉴스 아이템 파싱 중 오류: {e}")
            return None
    
    def _parse_relative_time(self, time_str: str) -> datetime:
        """상대적 시간 문자열을 datetime으로 변환"""
        try:
            now = datetime.now()
            
            if "분 전" in time_str:
                minutes = int(time_str.replace("분 전", "").strip())
                return now - timedelta(minutes=minutes)
            elif "시간 전" in time_str:
                hours = int(time_str.replace("시간 전", "").strip())
                return now - timedelta(hours=hours)
            elif "일 전" in time_str:
                days = int(time_str.replace("일 전", "").strip())
                return now - timedelta(days=days)
            else:
                return now
                
        except:
            return datetime.now()
    
    async def crawl_multiple_stocks(self, stock_list: List[Dict], max_articles_per_stock: int = 5) -> Dict:
        """여러 종목의 뉴스를 동시에 크롤링"""
        results = {
            "total_stocks": len(stock_list),
            "success_count": 0,
            "articles": [],
            "errors": []
        }
        
        # 동시 크롤링 작업 생성
        tasks = []
        for stock in stock_list:
            stock_name = stock.get("name", "")
            if stock_name:
                task = self.crawl_naver_news(stock_name, max_articles_per_stock)
                tasks.append((stock, task))
        
        # 모든 작업 실행
        for stock, task in tasks:
            try:
                articles = await task
                if articles:
                    results["articles"].extend(articles)
                    results["success_count"] += 1
                
                # API 호출 제한을 위한 딜레이
                await asyncio.sleep(1)
                
            except Exception as e:
                error_msg = f"{stock.get('name', '')} 뉴스 수집 실패: {str(e)}"
                results["errors"].append(error_msg)
                logger.error(error_msg)
        
        logger.info(f"뉴스 크롤링 완료 - 성공: {results['success_count']}/{results['total_stocks']}, 총 기사: {len(results['articles'])}개")
        return results

# 뉴스 크롤러 인스턴스 생성
news_crawler = NewsWebCrawler()