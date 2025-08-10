import asyncio
import logging
import requests
import os
from datetime import datetime
from dotenv import load_dotenv
from .Trader import KISAutoTrader
from .TelegramNotifier import Wallet_No_MOENY,NO_STOCK,test_telegram_async

load_dotenv()
logger = logging.getLogger(__name__)

class KISAutoTraderWithBalance:
    def __init__(self):
        self.base_url = "https://openapi.koreainvestment.com:9443"
        self.account_no = os.getenv("account_no") # 실제 계좌번호
        self.account_cd = "01"
        self.auto_trader = KISAutoTrader()
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
                auth_header = f"Bearer {access_token}"
                
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
    
    async def get_account_balance(self, redis_client):
        """계좌 잔고 조회"""
        try:
            logger.info("📊 계좌 잔고 조회 중...")
            
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/inquire-balance"
            headers = await self.get_trading_headers(redis_client, "TTTC8434R")
            
            if not headers:
                return None
            
            params = {
                "CANO": self.account_no,
                "ACNT_PRDT_CD": self.account_cd,
                "AFHR_FLPR_YN": "N",
                "OFL_YN" : "",
                "INQR_DVSN": "02",
                "UNPR_DVSN": "01",
                "FUND_STTL_ICLD_YN": "N",
                "FNCG_AMT_AUTO_RDPT_YN": "N",
                "PRCS_DVSN": "01",
                "CTX_AREA_FK100": "",                  
                "CTX_AREA_NK100": ""   
            }
            logger.info(f"{params}")
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('rt_cd') == '0':
                    logger.info(f"✅ 계좌 잔고 조회 성공 {result}")
                    return result
                else:
                    logger.error(f"잔고 조회 실패: {result.get('msg1', '')}")
            else:
                logger.error(f"잔고 조회 API 에러: {response.status_code}")
                logger.error(f"응답: {response.text}")
            
            return None
            
        except Exception as e:
            logger.error(f"잔고 조회 에러: {e}")
            return None
    
    async def check_stock_holding(self, stock_code, redis_client):
        """특정 종목 보유 여부 확인"""
        try:
            balance_data = await self.get_account_balance(redis_client)
            if not balance_data:
                return None
            
            # 보유 종목 리스트
            holdings = balance_data.get('output1', [])
            
            for holding in holdings:
                if holding.get('pdno') == stock_code:  # 종목코드 일치
                    quantity = int(holding.get('hldg_qty', 0))
                    if quantity > 0:
                        avg_price = float(holding.get('pchs_avg_pric', 0))
                        current_price = float(holding.get('prpr', 0))
                        
                        logger.info(f"💼 {stock_code} 보유 확인:")
                        logger.info(f"   수량: {quantity}주")
                        logger.info(f"   평균매수가: {avg_price:,.0f}원")
                        logger.info(f"   현재가: {current_price:,.0f}원")
                        
                        profit_rate = ((current_price - avg_price) / avg_price) * 100 if avg_price > 0 else 0
                        logger.info(f"   수익률: {profit_rate:+.2f}%")
                        
                        return {
                            'quantity': quantity,
                            'avg_price': avg_price,
                            'current_price': current_price,
                            'profit_rate': profit_rate
                        }
            
            logger.info(f"📭 {stock_code} 미보유")
            return None
            
        except Exception as e:
            logger.error(f"보유 확인 에러: {e}")
            return None
    
    async def get_available_cash(self, redis_client):
        """매수 가능한 현금 조회"""
        try:
            balance_data = await self.get_account_balance(redis_client)
            if not balance_data:
                return 0
            
            # 주문 가능 현금
            available_cash = int(balance_data.get('output2', [{}])[0].get('prvs_rcdl_excc_amt', 0))
            logger.info(f"💰 주문 가능 현금: {available_cash:,}원")
            
            return available_cash
            
        except Exception as e:
            logger.error(f"현금 조회 에러: {e}")
            return 0
    
    async def place_buy_order_with_check(self, stockname, stock_code, redis_client, order_amount,kind ):
        """잔고 확인 후 매수 주문"""
        try:
           
            logger.info(f"🔥 {stock_code} 매수 주문 시작")
            
            # 1. 이미 보유 중인지 확인
            holding = await self.check_stock_holding(stock_code, redis_client)
            if holding:
                logger.warning(f"⚠️ {stock_code} 이미 보유 중입니다!")
                logger.warning(f"   보유수량: {holding['quantity']}주")
                logger.warning(f"   🚫 중복 매수를 방지합니다.")
                return False
            
            # 2. 매수 가능 현금 확인
            available_cash = await self.get_available_cash(redis_client)
            if available_cash < order_amount:
                await Wallet_No_MOENY(stockname,redis_client,kind)
                logger.warning(f"⚠️ 매수 가능 현금 부족!")
                logger.warning(f"   필요금액: {order_amount:,}원")
                logger.warning(f"   보유현금: {available_cash:,}원")
                return False


            trade_success = await self.auto_trader.place_buy_order(
                    stockname , stock_code, redis_client, order_amount,kind
            )
            return trade_success
        except Exception as e:
            logger.error(f"매수 주문 에러: {e}")
            return False
    
    async def place_sell_order_with_check(self, stockname, stock_code, redis_client):
        """잔고 확인 후 매도 주문"""
        try:
            logger.info(f"🔥 {stock_code} 매도 주문 시작")
            
            # 1. 보유 여부 확인
            holding = await self.check_stock_holding(stock_code, redis_client)
            if not holding:
                logger.warning(f"⚠️ {stock_code} 보유 종목이 아닙니다!")
                logger.warning(f"   🚫 매도할 수 없습니다.")
                return False
            

            trade_success = await self.auto_trader.place_sell_order(
                stockname , stock_code, redis_client , holding
            )
            
            return trade_success
            
        except Exception as e:
            logger.error(f"매도 주문 에러: {e}")
            return False
   