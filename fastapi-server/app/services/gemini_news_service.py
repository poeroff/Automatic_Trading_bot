# app/services/gemini_news_service.py

import google.generativeai as genai
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import quote
from datetime import datetime
from typing import List, Dict
import logging
from decouple import config
import json

logger = logging.getLogger(__name__)

class GeminiNewsAnalyzer:
    def __init__(self):
        # Gemini API 키 설정
        self.api_key = config("GEMINI_API_KEY", default="")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            logger.warning("GEMINI_API_KEY가 설정되지 않았습니다.")
            self.model = None
        
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    async def crawl_naver_news(self, stock_name: str, max_articles: int = 10) -> List[Dict]:
        """네이버 뉴스 실제 크롤링"""
        try:
            search_query = f"{stock_name} 주식"
            encoded_query = quote(search_query)
            url = f"https://search.naver.com/search.naver?where=news&query={encoded_query}&sort=1"
            
            articles = []
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=15) as response:
                    if response.status != 200:
                        logger.error(f"네이버 뉴스 요청 실패: {response.status}")
                        return []
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # 뉴스 아이템 찾기
                    news_items = soup.find_all('div', class_='news_area')[:max_articles]
                    
                    for item in news_items:
                        try:
                            # 제목과 링크
                            title_element = item.find('a', class_='news_tit')
                            if not title_element:
                                continue
                                
                            title = title_element.get('title', '').strip()
                            link = title_element.get('href', '')
                            
                            # 언론사
                            press_element = item.find('a', class_='info press')
                            press = press_element.text.strip() if press_element else "알 수 없음"
                            
                            # 시간
                            time_element = item.find('span', class_='info')
                            time_text = time_element.text.strip() if time_element else ""
                            
                            # 본문 미리보기
                            content_element = item.find('div', class_='news_dsc')
                            content = content_element.text.strip() if content_element else ""
                            
                            if title and link:
                                articles.append({
                                    'title': title,
                                    'content': content,
                                    'url': link,
                                    'press': press,
                                    'time': time_text,
                                    'source': '네이버뉴스'
                                })
                                
                        except Exception as e:
                            logger.warning(f"뉴스 항목 파싱 오류: {e}")
                            continue
            
            logger.info(f"{stock_name} 네이버 뉴스 {len(articles)}개 수집 완료")
            return articles
            
        except Exception as e:
            logger.error(f"네이버 뉴스 크롤링 실패 ({stock_name}): {e}")
            return []
    
    async def analyze_with_gemini(self, news_data: Dict, stock_name: str) -> Dict:
        """Gemini LLM으로 뉴스 분석"""
        if not self.model:
            # Gemini 없을 때 기본 분석
            return {
                "sentiment": "중립",
                "confidence": 0.5,
                "summary": "Gemini API 키가 없어 기본 분석을 수행했습니다.",
                "investment_advice": "추가 분석이 필요합니다.",
                "key_points": ["API 키 설정 필요"]
            }
        
        try:
            prompt = f"""
다음은 {stock_name} 관련 뉴스입니다. 투자 관점에서 분석해주세요.

제목: {news_data['title']}
내용: {news_data['content']}
언론사: {news_data['press']}

다음 항목들을 JSON 형태로 분석해주세요:
1. sentiment: "매우긍정", "긍정", "중립", "부정", "매우부정" 중 하나
2. confidence: 0.0~1.0 사이의 신뢰도
3. summary: 3-4문장으로 요약
4. investment_advice: 투자 조언 (매수/보유/매도/관망)
5. key_points: 주요 포인트들 배열 (3-5개)
6. price_impact: 주가에 미치는 영향 예상 ("상승", "하락", "중립")
7. timeframe: 영향 지속 기간 ("단기", "중기", "장기")

JSON 형태로만 답변해주세요.
"""

            response = self.model.generate_content(prompt)
            
            try:
                # JSON 응답 파싱
                analysis_result = json.loads(response.text)
                logger.info(f"Gemini 분석 완료: {stock_name}")
                return analysis_result
                
            except json.JSONDecodeError:
                # JSON 파싱 실패시 텍스트 응답 처리
                logger.warning("Gemini JSON 파싱 실패, 텍스트 분석 진행")
                return {
                    "sentiment": "중립",
                    "confidence": 0.7,
                    "summary": response.text[:200],
                    "investment_advice": "추가 분석 필요",
                    "key_points": ["Gemini 응답 처리 중"],
                    "price_impact": "중립",
                    "timeframe": "단기"
                }
                
        except Exception as e:
            logger.error(f"Gemini 분석 실패: {e}")
            return {
                "sentiment": "중립",
                "confidence": 0.3,
                "summary": f"분석 중 오류 발생: {str(e)}",
                "investment_advice": "수동 분석 권장",
                "key_points": ["오류 발생"],
                "price_impact": "중립",
                "timeframe": "알 수 없음"
            }
    
    async def crawl_and_analyze_stock(self, stock_name: str, stock_code: str) -> Dict:
        """종목 뉴스 크롤링 및 Gemini 분석"""
        try:
            # 1. 뉴스 크롤링
            logger.info(f"{stock_name} 뉴스 크롤링 시작...")
            articles = await self.crawl_naver_news(stock_name, max_articles=5)
            
            if not articles:
                return {
                    "stock_name": stock_name,
                    "stock_code": stock_code,
                    "articles": [],
                    "gemini_analysis": {
                        "overall_sentiment": "데이터 없음",
                        "summary": "수집된 뉴스가 없습니다."
                    },
                    "crawled_at": datetime.now().isoformat()
                }
            
            # 2. 각 뉴스별 Gemini 분석
            analyzed_articles = []
            sentiment_scores = []
            
            for article in articles:
                logger.info(f"Gemini 분석 중: {article['title'][:30]}...")
                
                gemini_result = await self.analyze_with_gemini(article, stock_name)
                
                article['gemini_analysis'] = gemini_result
                analyzed_articles.append(article)
                
                # 감정 점수 수집
                sentiment_map = {
                    "매우긍정": 2, "긍정": 1, "중립": 0, 
                    "부정": -1, "매우부정": -2
                }
                score = sentiment_map.get(gemini_result.get('sentiment', '중립'), 0)
                sentiment_scores.append(score)
                
                # API 제한 고려 딜레이
                await asyncio.sleep(1)
            
            # 3. 전체 분석 요약
            avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
            
            if avg_sentiment > 0.5:
                overall_sentiment = "전반적으로 긍정적"
            elif avg_sentiment < -0.5:
                overall_sentiment = "전반적으로 부정적"
            else:
                overall_sentiment = "중립적"
            
            # 4. Gemini로 전체 요약 분석
            overall_analysis = await self.get_overall_analysis(analyzed_articles, stock_name)
            
            return {
                "stock_name": stock_name,
                "stock_code": stock_code,
                "articles": analyzed_articles,
                "gemini_analysis": {
                    "overall_sentiment": overall_sentiment,
                    "average_sentiment_score": round(avg_sentiment, 2),
                    "total_articles": len(analyzed_articles),
                    "summary": overall_analysis,
                    "recommendation": self.get_investment_recommendation(avg_sentiment)
                },
                "crawled_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"{stock_name} 분석 실패: {e}")
            return {
                "stock_name": stock_name,
                "stock_code": stock_code,
                "error": str(e),
                "gemini_analysis": {"error": "분석 실패"},
                "crawled_at": datetime.now().isoformat()
            }
    
    async def get_overall_analysis(self, articles: List[Dict], stock_name: str) -> str:
        """전체 뉴스들에 대한 Gemini 종합 분석"""
        if not self.model or not articles:
            return "종합 분석을 수행할 수 없습니다."
        
        try:
            # 뉴스 제목들 수집
            titles = [article['title'] for article in articles[:3]]  # 최대 3개
            
            prompt = f"""
{stock_name}에 대한 다음 뉴스들을 종합적으로 분석해주세요:

뉴스 제목들:
{chr(10).join([f"- {title}" for title in titles])}

3-4문장으로 투자자 관점에서 종합 요약해주세요.
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"전체 분석 실패: {e}")
            return f"종합 분석 중 오류가 발생했습니다: {str(e)}"
    
    def get_investment_recommendation(self, sentiment_score: float) -> str:
        """감정 점수 기반 투자 추천"""
        if sentiment_score >= 1.0:
            return "적극 매수 고려"
        elif sentiment_score >= 0.5:
            return "매수 검토"
        elif sentiment_score >= -0.5:
            return "관망 또는 보유"
        elif sentiment_score >= -1.0:
            return "매도 검토"
        else:
            return "적극 매도 고려"

# Gemini 뉴스 분석기 인스턴스
gemini_analyzer = GeminiNewsAnalyzer()