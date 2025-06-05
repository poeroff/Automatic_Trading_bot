# fastapi-server/app/services/improved_kis_service.py

import httpx
from decouple import config
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import asyncio

from ..database import execute_query

logger = logging.getLogger(__name__)

# 한국투자증권 API 기본 URL 
KIS_BASE_URL = "https://openapivts.koreainvestment.com:29443"  # 모의투자서버
# KIS_BASE_URL = "https://openapi.koreainvestment.com:9443"  # 실전투자서버

class ImprovedKISService:
    def __init__(self):
        self._access_token = None
        self._token_expires = None
        
    async def get_access_token(self, force_refresh: bool = False):
        """KIS API 접근 토큰 발급/갱신"""
        # 토큰이 유효하면 재사용
        if not force_refresh and self._access_token and self._token_expires:
            if datetime.now() < self._token_expires:
                return self._access_token
        
        headers = {"content-type": "application/json"}
        body = {
            "grant_type": "client_credentials",
            "appkey": config("appkey"),
            "appsecret": config("appsecret")
        }
        
        token_url = f"{KIS_BASE_URL}/oauth2/tokenP"
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(token_url, headers=headers, json=body)
            
            if response.status_code != 200:
                logger.error(f"KIS 토큰 발급 실패: {response.text}")
                return None

            token_data = response.json()
            self._access_token = f"Bearer {token_data['access_token']}"
            # 토큰 유효기간 설정 (보통 24시간, 여기서는 23시간으로 안전하게)
            self._token_expires = datetime.now() + timedelta(hours=23)
            
            logger.info("KIS 접근 토큰 발급/갱신 성공")
            return self._access_token
            
        except Exception as e:
            logger.error(f"KIS 토큰 발급 중 오류: {e}")
            return None

    async def get_all_kospi_stocks(self) -> List[Dict[str, Any]]:
        """KOSPI 전체 종목 조회"""
        return await self._get_stock_list_by_market("KOSPI")
    
    async def get_all_kosdaq_stocks(self) -> List[Dict[str, Any]]:
        """KOSDAQ 전체 종목 조회"""
        return await self._get_stock_list_by_market("KOSDAQ")
    
    async def _get_stock_list_by_market(self, market: str) -> List[Dict[str, Any]]:
        """시장별 종목 리스트 조회 - 기존 방식이 안될 경우 다른 API 시도"""
        token = await self.get_access_token()
        if not token:
            return []
        
        # 방법 1: 종목 마스터 조회 API 시도
        stocks = await self._try_stock_master_api(market, token)
        if stocks:
            return stocks
        
        # 방법 2: 종목 검색 API 시도  
        stocks = await self._try_search_stock_api(market, token)
        if stocks:
            return stocks
            
        # 방법 3: 시세 조회를 통한 종목 리스트 구성
        return await self._try_price_inquiry_api(market, token)

    async def _try_stock_master_api(self, market: str, token: str) -> List[Dict[str, Any]]:
        """종목 마스터 조회 API"""
        try:
            path = "/uapi/domestic-stock/v1/quotations/psearch-title"
            url = f"{KIS_BASE_URL}{path}"
            
            headers = {
                "content-type": "application/json",
                "authorization": token,
                "appkey": config("appkey"),
                "appsecret": config("appsecret"),
                "tr_id": "CTPF1604R",
                "custtype": "P"
            }
            
            params = {
                "user_id": "",
                "seq": "",
                "gubun": "1" if market == "KOSPI" else "2",
                "schdate": "",
                "schgubun": "",
                "schkeyword": ""
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers, params=params)

            if response.status_code == 200:
                result = response.json()
                stocks = result.get('output', [])
                logger.info(f"종목 마스터 API로 {market} 종목 {len(stocks)}개 수신")
                return stocks
                
        except Exception as e:
            logger.warning(f"종목 마스터 API 실패: {e}")
        
        return []

    async def _try_search_stock_api(self, market: str, token: str) -> List[Dict[str, Any]]:
        """종목 검색 API"""
        try:
            path = "/uapi/domestic-stock/v1/quotations/search-stock-info"
            url = f"{KIS_BASE_URL}{path}"
            
            headers = {
                "content-type": "application/json",
                "authorization": token,
                "appkey": config("appkey"),
                "appsecret": config("appsecret"),
                "tr_id": "CTPF1002R",
                "custtype": "P"
            }
            
            params = {
                "PDNO": "",
                "PRDT_TYPE_CD": "300",
                "MKT_ID_CD": "0" if market == "KOSPI" else "1",
                "SCHTYPE": "1"
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers, params=params)

            if response.status_code == 200:
                result = response.json()
                stocks = result.get('output', [])
                logger.info(f"종목 검색 API로 {market} 종목 {len(stocks)}개 수신")
                return stocks
                
        except Exception as e:
            logger.warning(f"종목 검색 API 실패: {e}")
        
        return []
        
    async def _try_price_inquiry_api(self, market: str, token: str) -> List[Dict[str, Any]]:
        """주요 종목 코드로 가격 조회하여 유효한 종목 찾기"""
        # 주요 종목 코드들 (실제로는 더 많은 종목 코드를 사용)
        major_stocks = {
            "KOSPI": ["005930", "000660", "373220", "207940", "005380", "005490", "035420", "068270", "035720", "051910"],
            "KOSDAQ": ["091990", "263750", "066970", "196170", "214150", "058470", "376300", "096770", "365340", "036570"]
        }
        
        stocks = []
        stock_codes = major_stocks.get(market, [])
        
        for code in stock_codes:
            try:
                stock_info = await self.get_stock_price(code)
                if stock_info:
                    # 종목 이름 조회
                    name = await self._get_stock_name(code, token)
                    stocks.append({
                        "mksc_shrn_iscd": code,
                        "itms_nm": name or f"종목{code}",
                        "market": market
                    })
                    await asyncio.sleep(0.1)  # API 호출 제한
                    
            except Exception as e:
                logger.warning(f"종목 {code} 정보 조회 실패: {e}")
                
        logger.info(f"가격 조회 방식으로 {market} 종목 {len(stocks)}개 수집")
        return stocks

    async def _get_stock_name(self, stock_code: str, token: str) -> Optional[str]:
        """종목 코드로 종목명 조회"""
        try:
            path = "/uapi/domestic-stock/v1/quotations/inquire-price"
            url = f"{KIS_BASE_URL}{path}"
            
            headers = {
                "content-type": "application/json",
                "authorization": token,
                "appkey": config("appkey"),
                "appsecret": config("appsecret"),
                "tr_id": "FHKST01010100",
                "custtype": "P"
            }
            
            params = {
                "FID_COND_MRKT_DIV_CODE": "J",
                "FID_INPUT_ISCD": stock_code
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers, params=params)

            if response.status_code == 200:
                result = response.json()
                return result.get('output', {}).get('hts_kor_isnm', '')
                
        except Exception:
            pass
        
        return None

    async def get_stock_price(self, stock_code: str) -> Optional[Dict[str, Any]]:
        """개별 종목 현재가 조회"""
        token = await self.get_access_token()
        if not token:
            return None
        
        path = "/uapi/domestic-stock/v1/quotations/inquire-price"
        url = f"{KIS_BASE_URL}{path}"
        
        headers = {
            "content-type": "application/json",
            "authorization": token,
            "appkey": config("appkey"),
            "appsecret": config("appsecret"),
            "tr_id": "FHKST01010100",
            "custtype": "P"
        }
        
        params = {
            "FID_COND_MRKT_DIV_CODE": "J",
            "FID_INPUT_ISCD": stock_code
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers, params=params)

            if response.status_code != 200:
                logger.error(f"종목 {stock_code} 현재가 조회 실패: {response.text}")
                return None
            
            result = response.json()
            price_data = result.get('output', {})
            
            return {
                "stock_code": stock_code,
                "current_price": price_data.get('stck_prpr', '0'),        # 현재가
                "change_rate": price_data.get('prdy_ctrt', '0'),          # 등락률
                "change_amount": price_data.get('prdy_vrss', '0'),        # 등락가
                "volume": price_data.get('acml_vol', '0'),                # 거래량
                "market_cap": price_data.get('hts_avls', '0'),            # 시가총액
                "high_price": price_data.get('stck_hgpr', '0'),           # 고가
                "low_price": price_data.get('stck_lwpr', '0'),            # 저가
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"종목 {stock_code} 현재가 조회 중 오류: {e}")
            return None

    async def bulk_sync_stocks_to_db(self, pool, markets: List[str] = ["KOSPI", "KOSDAQ"]) -> Dict[str, int]:
        """KIS API에서 받은 종목들을 DB에 대량 동기화"""
        result = {"total_fetched": 0, "new_added": 0, "updated": 0, "errors": 0}
        
        for market in markets:
            try:
                logger.info(f"{market} 종목 동기화 시작...")
                
                if market == "KOSPI":
                    stocks = await self.get_all_kospi_stocks()
                elif market == "KOSDAQ":
                    stocks = await self.get_all_kosdaq_stocks()
                else:
                    continue
                
                result["total_fetched"] += len(stocks)
                
                for stock in stocks:
                    try:
                        stock_code = stock.get('mksc_shrn_iscd', '')
                        stock_name = stock.get('itms_nm', '')
                        
                        if not stock_code or not stock_name:
                            continue
                        
                        # DB에 종목 존재 여부 확인
                        check_query = "SELECT id FROM stocks WHERE ticker = %s"
                        existing = await execute_query(check_query, (stock_code,), pool=pool)
                        
                        if existing:
                            # 기존 종목 업데이트
                            update_query = """
                                UPDATE stocks 
                                SET name = %s, market = %s, updated_at = NOW()
                                WHERE ticker = %s
                            """
                            await execute_query(update_query, (stock_name, market, stock_code), pool=pool)
                            result["updated"] += 1
                        else:
                            # 새 종목 추가
                            insert_query = """
                                INSERT INTO stocks (ticker, name, market, created_at, updated_at)
                                VALUES (%s, %s, %s, NOW(), NOW())
                            """
                            await execute_query(insert_query, (stock_code, stock_name, market), pool=pool)
                            result["new_added"] += 1
                        
                        # API 호출 제한을 위한 딜레이
                        await asyncio.sleep(0.1)
                        
                    except Exception as e:
                        logger.error(f"종목 저장 실패 - {stock}: {e}")
                        result["errors"] += 1
                
                logger.info(f"{market} 종목 동기화 완료 - 신규: {result['new_added']}, 업데이트: {result['updated']}")
                
            except Exception as e:
                logger.error(f"{market} 종목 동기화 중 오류: {e}")
                result["errors"] += 1
        
        return result

    async def get_stock_chart_data(self, stock_code: str, period: str = "D", count: int = 30) -> List[Dict[str, Any]]:
        """종목 차트 데이터 조회 (일봉, 주봉, 월봉)"""
        token = await self.get_access_token()
        if not token:
            return []
        
        path = "/uapi/domestic-stock/v1/quotations/inquire-daily-price"
        url = f"{KIS_BASE_URL}{path}"
        
        headers = {
            "content-type": "application/json",
            "authorization": token,
            "appkey": config("appkey"),
            "appsecret": config("appsecret"),
            "tr_id": "FHKST01010400",
            "custtype": "P"
        }
        
        # 조회 종료일 (오늘)
        end_date = datetime.now().strftime("%Y%m%d")
        
        params = {
            "FID_COND_MRKT_DIV_CODE": "J",
            "FID_INPUT_ISCD": stock_code,
            "FID_PERIOD_DIV_CODE": period,  # D: 일봉, W: 주봉, M: 월봉
            "FID_ORG_ADJ_PRC": "1",        # 수정주가 반영
            "FID_INPUT_DATE_1": end_date
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers, params=params)

            if response.status_code != 200:
                logger.error(f"종목 {stock_code} 차트 데이터 조회 실패: {response.text}")
                return []
            
            result = response.json()
            chart_data = result.get('output', [])
            
            # 데이터 가공
            processed_data = []
            for item in chart_data[:count]:
                processed_data.append({
                    "date": item.get('stck_bsop_date', ''),
                    "open": float(item.get('stck_oprc', 0)),
                    "high": float(item.get('stck_hgpr', 0)),
                    "low": float(item.get('stck_lwpr', 0)),
                    "close": float(item.get('stck_clpr', 0)),
                    "volume": int(item.get('acml_vol', 0))
                })
            
            return processed_data
            
        except Exception as e:
            logger.error(f"종목 {stock_code} 차트 데이터 조회 중 오류: {e}")
            return []
        
    

# KIS 서비스 인스턴스 생성
kis_service = ImprovedKISService()