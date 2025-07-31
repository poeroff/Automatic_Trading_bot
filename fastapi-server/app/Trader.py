import asyncio
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv
import os
from .TelegramNotifier import Buy_telegram_async,SELL_telegram_async

load_dotenv() 

logger = logging.getLogger(__name__)

class KISAutoTrader:
    def __init__(self):
        self.base_url = "https://openapi.koreainvestment.com:9443"

    
    async def get_trading_headers(self, redis_client, tr_id):
        """거래용 헤더 생성"""
        try:
            access_token = await redis_client.get("AccessToken")
            app_key = os.getenv("appkey")
            app_secret = os.getenv("appsecret")
            
            if not all([access_token, app_key, app_secret]):
                logger.error("거래 인증 정보 누락")
                return None
            
            auth_header = access_token
            if not access_token.startswith("Bearer "):
                auth_header = access_token
                
            return {
                "Content-Type": "application/json",
                "authorization": auth_header,
                "appkey": app_key,
                "appsecret": app_secret,
                "tr_id": tr_id,
                "custtype": "P"
            }
        except Exception as e:
            logger.error(f"거래 헤더 생성 에러: {e}")
            return None
    
    async def get_current_price(self, stock_code, redis_client):
        """현재가 조회"""
        try:
            url = f"{self.base_url}/uapi/domestic-stock/v1/quotations/inquire-price"
            headers = await self.get_trading_headers(redis_client, "FHKST01010100")
            
            params = {
                "FID_COND_MRKT_DIV_CODE": "J",
                "FID_INPUT_ISCD": stock_code
            }
            
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 200:
                data = response.json()
                if 'output' in data:
                    current_price = int(data['output']['stck_prpr'])
                    return current_price
            
            logger.error(f"{stock_code} 현재가 조회 실패")
            return None
        except Exception as e:
            logger.error(f"현재가 조회 에러: {e}")
            return None
    
    async def calculate_order_quantity(self, stock_code, price, order_amount=100000):
        """주문 수량 계산 (기본 10만원 기준)"""
        try:
            quantity = order_amount // price
            if quantity < 1:
                logger.warning(f"{stock_code} 주문금액 부족 (가격: {price:,}원)")
                return 0
            return quantity
        except Exception as e:
            logger.error(f"수량 계산 에러: {e}")
            return 0
    
    async def place_buy_order(self, stockname, stock_code, redis_client, order_amount=100000):
        """매수 주문"""
        try:
            logger.info(f"🔥 {stock_code} 매수 주문 시작")
            
            # 현재가 조회
            current_price = await self.get_current_price(stock_code, redis_client)
            if not current_price:
                return False
            
            # 주문 수량 계산
            quantity = await self.calculate_order_quantity(stock_code, current_price, order_amount)
            if quantity == 0:
                return False
            
            # 매수 주문 실행
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/order-cash"
            headers = await self.get_trading_headers(redis_client, "VTTC0012U")  # 현금 매수
            
            if not headers:
                return False
            
            order_data = {
                "CANO": os.getenv("account_no"),  # 종합계좌번호 (실제 값으로 변경 필요)
                "ACNT_PRDT_CD": "01",  # 계좌상품코드
                "PDNO": stock_code,  # 종목코드
                "ORD_DVSN": "01",  # 주문구분 (01: 시장가)
                "ORD_QTY": str(quantity),  # 주문수량
                "ORD_UNPR": "0",  # 주문단가 (시장가는 0)
            }
            
            response = requests.post(url, headers=headers, json=order_data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('rt_cd') == '0':  # 성공
                    order_no = result.get('output', {}).get('ODNO', '')
                    logger.info(f"✅ {stock_code} 매수 주문 성공!")
                    logger.info(f"   주문번호: {order_no}")
                    logger.info(f"   수량: {quantity}주")
                    logger.info(f"   예상금액: {current_price * quantity:,}원")


                    await Buy_telegram_async(stockname, order_no, quantity, current_price, current_price * quantity)
                    return True
                else:
                    logger.error(f"❌ {stock_code} 매수 주문 실패: {result.get('msg1', '')}")
            else:
                logger.error(f"❌ {stock_code} 매수 주문 API 에러: {response.status_code}")
            
            return False
            
        except Exception as e:
            logger.error(f"매수 주문 에러: {e}")
            return False
    
    async def place_sell_order(self,stockname, stock_code, redis_client, holding):
        """매도 주문"""
        try:
            
            # 매도 주문 실행
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/order-cash"
            headers = await self.get_trading_headers(redis_client, "VTTC0011U")  # 현금 매도
            
            if not headers:
                return False
            
            order_data = {
                "CANO": os.getenv("account_no"),  # 종합계좌번호 (실제 값으로 변경 필요)
                "ACNT_PRDT_CD": "01",  # 계좌상품코드
                "PDNO": stock_code,  # 종목코드
                "ORD_DVSN": "01",  # 주문구분 (01: 시장가)
                "ORD_QTY": str(holding['quantity']),  # 주문수량
                "ORD_UNPR": "0",  # 주문단가 (시장가는 0)
            }
            
            response = requests.post(url, headers=headers, json=order_data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('rt_cd') == '0':  # 성공
                    order_no = result.get('output', {}).get('ODNO', '')
                    current_price = await self.get_current_price(stock_code, redis_client)
                    
                    logger.info(f"✅ {stock_code} 매도 주문 성공!")
                    logger.info(f"   주문번호: {order_no}")
                    logger.info(f"   수량: {holding['quantity']}주")
                    logger.info(f"   예상금액: {current_price * holding['quantity']:,}원")

                    profit_amount = (holding['current_price'] - holding['avg_price']) * holding['quantity']
                    if profit_amount > 0:
                        logger.info(f"   🎉 수익 실현!")
                        await SELL_telegram_async(stockname, order_no, holding['quantity'], current_price, current_price * holding['quantity'], profit_amount, True)

                    else:
                        logger.info(f"   😢 손실 확정")
                        await SELL_telegram_async(stockname, order_no, holding['quantity'], current_price * holding['quantity'], profit_amount, False)

                    
                    return True
                else:
                    logger.error(f"❌ {stock_code} 매도 주문 실패: {result.get('msg1', '')}")
            else:
                logger.error(f"❌ {stock_code} 매도 주문 API 에러: {response.status_code}")
            
            return False
            
        except Exception as e:
            logger.error(f"매도 주문 에러: {e}")
            return False