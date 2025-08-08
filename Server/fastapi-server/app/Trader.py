import asyncio
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv
import os
from .TelegramNotifier import Buy_telegram_async,SELL_telegram_async,BUY_ERROR,SEEL_ERROR,COUNT_EROR,PRICE_EROR,BUY_API_ERROR

load_dotenv() 

logger = logging.getLogger(__name__)

class KISAutoTrader:
    def __init__(self):
        self.base_url = "https://openapi.koreainvestment.com:9443"
        self.account_number = os.getenv("account_no")

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

    async def get_account_balance(self, redis_client):
        """계좌 잔고 조회"""
        try:
            headers = await self.get_trading_headers(redis_client, "TTTC8434R")
            if not headers:
                return None
                
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/inquire-balance"
            
            params = {
                "CANO": self.account_number,
                "ACNT_PRDT_CD": "01",
                "AFHR_FLPR_YN": "N",
                "OFL_YN": "",
                "INQR_DVSN": "02",
                "UNPR_DVSN": "01",
                "FUND_STTL_ICLD_YN": "N",
                "FNCG_AMT_AUTO_RDPT_YN": "N",
                "PRCS_DVSN": "00",
                "CTX_AREA_FK100": "",
                "CTX_AREA_NK100": ""
            }
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if 'output2' in data and data['output2']:
                    output2 = data['output2'][0]
                    balance_info = {
                        'total_deposit': int(output2.get('dnca_tot_amt', 0)),
                        'today_buy_amount': int(output2.get('thdt_buy_amt', 0)),
                        'available_amount': int(output2.get('dnca_tot_amt', 0)) - int(output2.get('thdt_buy_amt', 0))
                    }
                    logger.info(f"계좌 잔고: 예수금 {balance_info['total_deposit']:,}원, 당일매수 {balance_info['today_buy_amount']:,}원, 가용 {balance_info['available_amount']:,}원")
                    return balance_info
            
            logger.error(f"잔고 조회 실패: {response.status_code}")
            return None
            
        except Exception as e:
            logger.error(f"잔고 조회 에러: {e}")
            return None

    async def get_order_possible_amount(self, stock_code, price, redis_client):
        """특정 종목의 주문가능금액 조회"""
        try:
            headers = await self.get_trading_headers(redis_client, "TTTC8908R")
            if not headers:
                return {'available_cash': 0, 'max_quantity': 0}
                
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/inquire-psbl-order"
            
            # 시장가로 조회
            params = {
                "CANO": self.account_number,
                "ACNT_PRDT_CD": "01",
                "PDNO": stock_code,
                "ORD_UNPR": "0",
                "ORD_DVSN": "01"
            }
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"{stock_code} API 응답: {data}")
                
                if 'output' in data and data.get('rt_cd') == '0':
                    api_available = int(data['output'].get('ord_psbl_cash', 0))
                    max_qty = int(data['output'].get('ord_psbl_qty', 0))
                    
                    logger.info(f"{stock_code} API 주문가능: {api_available:,}원, 최대수량: {max_qty}주")
                    return {'available_cash': api_available, 'max_quantity': max_qty}
                else:
                    error_msg = data.get('msg1', '')
                    logger.warning(f"{stock_code} API 조회 실패: {error_msg}")
            
            return {'available_cash': 0, 'max_quantity': 0}
            
        except Exception as e:
            logger.error(f"주문가능금액 조회 에러: {e}")
            return {'available_cash': 0, 'max_quantity': 0}
    
    async def cancel_all_pending_orders(self, redis_client):
        """모든 미체결 주문 취소"""
        try:
            logger.info("🔥 모든 미체결 주문 취소 시작")
            
            # 미체결 주문 조회
            headers = await self.get_trading_headers(redis_client, "TTTC8001R")
            if not headers:
                return False
                
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/inquire-ccnl"
            
            params = {
                "CANO": self.account_number,
                "ACNT_PRDT_CD": "01",
                "INQR_STRT_DT": datetime.now().strftime("%Y%m%d"),
                "INQR_END_DT": datetime.now().strftime("%Y%m%d"),
                "SLL_BUY_DVSN_CD": "00",  # 전체
                "INQR_DVSN": "00",
                "PDNO": "",
                "CCLD_DVSN": "00",  # 미체결만
                "ORD_GNO_BRNO": "",
                "ODNO": "",
                "INQR_DVSN_3": "00",
                "INQR_DVSN_1": "",
                "CTX_AREA_FK100": "",
                "CTX_AREA_NK100": ""
            }
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code != 200:
                logger.error(f"미체결 조회 실패: {response.status_code}")
                return False
                
            data = response.json()
            pending_orders = data.get('output1', [])
            
            if not pending_orders:
                logger.info("✅ 미체결 주문 없음")
                return True
            
            logger.info(f"📋 미체결 주문 {len(pending_orders)}건 발견")
            
            # 각 미체결 주문 취소
            cancel_count = 0
            for order in pending_orders:
                try:
                    stock_name = order.get('prdt_name', '')
                    order_no = order.get('odno', '')
                    order_qty = order.get('ord_qty', '')
                    order_price = order.get('ord_unpr', '')
                    
                    logger.info(f"취소 시도: {stock_name} 주문번호:{order_no} 수량:{order_qty}주 가격:{order_price}원")
                    
                    # 주문 취소 실행
                    cancel_headers = await self.get_trading_headers(redis_client, "TTTC0013U")
                    cancel_url = f"{self.base_url}/uapi/domestic-stock/v1/trading/order-cancel"
                    
                    cancel_data = {
                        "CANO": self.account_number,
                        "ACNT_PRDT_CD": "01",
                        "KRX_FWDG_ORD_ORGNO": "",
                        "ORGN_ODNO": order_no,
                        "ORD_DVSN": "00",
                        "RVSE_CNCL_DVSN_CD": "02",  # 취소
                        "ORD_QTY": "0",
                        "ORD_UNPR": "0",
                        "QTY_ALL_ORD_YN": "Y"  # 전량 취소
                    }
                    
                    cancel_response = requests.post(cancel_url, headers=cancel_headers, json=cancel_data)
                    
                    if cancel_response.status_code == 200:
                        cancel_result = cancel_response.json()
                        if cancel_result.get('rt_cd') == '0':
                            logger.info(f"✅ {stock_name} 주문 취소 성공")
                            cancel_count += 1
                        else:
                            logger.error(f"❌ {stock_name} 주문 취소 실패: {cancel_result.get('msg1', '')}")
                    else:
                        logger.error(f"❌ {stock_name} 주문 취소 API 에러: {cancel_response.status_code}")
                        
                    # API 제한 고려하여 딜레이
                    await asyncio.sleep(0.2)
                    
                except Exception as e:
                    logger.error(f"주문 취소 중 에러: {e}")
                    continue
            
            logger.info(f"🎯 미체결 주문 취소 완료: {cancel_count}/{len(pending_orders)}건")
            
            # 취소 후 잠시 대기 (시스템 반영 시간)
            if cancel_count > 0:
                logger.info("💤 주문 취소 반영 대기 중... (3초)")
                await asyncio.sleep(3)
            
            return cancel_count > 0
            
        except Exception as e:
            logger.error(f"미체결 주문 취소 에러: {e}")
            return False

    async def calculate_smart_order_quantity(self, stock_code, price, target_amount=100000, redis_client=None):
        """스마트 주문 수량 계산"""
        try:
            # 1. 계좌 잔고 확인
            balance_info = await self.get_account_balance(redis_client)
            if not balance_info:
                await COUNT_EROR()
                return 0
            
            # 2. API 주문가능금액 확인
            order_info = await self.get_order_possible_amount(stock_code, price, redis_client)
            
            method1_available = balance_info['available_amount']
            method2_available = order_info['available_cash']
            method3_max_qty = order_info['max_quantity']
            
            # API가 0을 반환하면 계좌 잔고만으로 계산
            if method2_available == 0 and method3_max_qty == 0:
                logger.warning(f"{stock_code} API 주문가능금액 0 - 계좌 잔고로만 계산")
                
                safe_amount = min(method1_available, target_amount) * 0.9
                
                # 수수료 및 세금 고려
                commission_tax = safe_amount * 0.002  # 0.5% 여유
                final_amount = safe_amount - commission_tax
                
                quantity = int(final_amount // price)
                
                if quantity < 1:
                    logger.warning(f"{stock_code} 극보수적 계산으로도 주문 불가능")
                    return 0
                
                actual_cost = quantity * price
                
                logger.info(f"=== {stock_code} 극보수적 계산 ===")
                logger.info(f"계좌가용: {method1_available:,}원")
                logger.info(f"1차안전금액: {safe_amount:,}원 (75%)")
                logger.info(f"수수료제외: {final_amount:,}원")
                logger.info(f"계산수량: {quantity}주 (추가 2-3주 차감)")
                logger.info(f"실제비용: {actual_cost:,}원")
                logger.info("===============================")
                
                return quantity
            
            # 정상적인 API 응답이 있을 때
            cash_available = min(method1_available, method2_available, target_amount)
            safe_amount = cash_available * 0.98
            
            calc_quantity = int(safe_amount // price)
            final_quantity = min(calc_quantity, method3_max_qty)
            
            if final_quantity < 1:
                logger.warning(f"{stock_code} 주문 불가능:")
                logger.warning(f"  계좌가용: {method1_available:,}원")
                logger.warning(f"  API가용: {method2_available:,}원")
                logger.warning(f"  최대수량: {method3_max_qty}주")
                logger.warning(f"  현재가: {price:,}원")
                return 0
            
            actual_cost = final_quantity * price
            
            logger.info(f"=== {stock_code} 스마트 주문 계산 ===")
            logger.info(f"목표금액: {target_amount:,}원")
            logger.info(f"계좌가용: {method1_available:,}원")
            logger.info(f"API가용: {method2_available:,}원")
            logger.info(f"API최대수량: {method3_max_qty}주")
            logger.info(f"안전금액: {safe_amount:,}원")
            logger.info(f"최종수량: {final_quantity}주")
            logger.info(f"예상비용: {actual_cost:,}원")
            logger.info("================================")
            
            return final_quantity
            
        except Exception as e:
            await COUNT_EROR()
            logger.error(f"스마트 수량 계산 에러: {e}")
            return 0

    async def calculate_order_quantity_conservative(self, stock_code, price, order_amount=100000, redis_client=None):
        """보수적 주문 수량 계산 - 기존 호환성 유지"""
        return await self.calculate_smart_order_quantity(stock_code, price, order_amount, redis_client)
        
    async def place_buy_order_with_reset(self, stockname, stock_code, redis_client, order_amount=100000):
        """미체결 주문 리셋 후 매수 주문"""
        try:
            logger.info(f"🔥 {stockname}({stock_code}) 리셋 후 매수 주문 시작")
            
            # 1. 모든 미체결 주문 취소
            reset_success = await self.cancel_all_pending_orders(redis_client)
            if reset_success:
                logger.info("✅ 미체결 주문 리셋 완료")
            else:
                logger.warning("⚠️ 미체결 주문 리셋 실패 또는 없음 - 진행")
            
            # 2. 현재가 조회
            current_price = await self.get_current_price(stock_code, redis_client)
            if not current_price:
                await PRICE_EROR()
                logger.error(f"{stockname} 현재가 조회 실패")
                return False
            
            # 3. 리셋 후 스마트 주문 수량 계산
            quantity = await self.calculate_smart_order_quantity(stock_code, current_price, order_amount, redis_client)
            if quantity == 0:
                logger.warning(f"{stockname} 리셋 후에도 주문 수량 0 - 주문 취소")
                return False
            
            logger.info(f"{stockname} 리셋 후 주문 시도: {quantity}주 × {current_price:,}원 = {quantity * current_price:,}원")

            # 4. 매수 주문 실행
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/order-cash"
            headers = await self.get_trading_headers(redis_client, "TTTC0012U")
            
            if not headers:
                await BUY_API_ERROR()
                return False

            order_data = {
                "CANO": self.account_number,
                "ACNT_PRDT_CD": "01",
                "PDNO": stock_code,
                "ORD_DVSN": "01",
                "ORD_QTY": str(quantity),
                "ORD_UNPR": "0",
            }
            
            response = requests.post(url, headers=headers, json=order_data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('rt_cd') == '0':
                    order_no = result.get('output', {}).get('ODNO', '')
                    total_amount = current_price * quantity
                    
                    logger.info(f"✅ {stockname} 리셋 후 매수 주문 성공!")
                    logger.info(f"   주문번호: {order_no}")
                    logger.info(f"   수량: {quantity}주")
                    logger.info(f"   단가: {current_price:,}원")
                    logger.info(f"   총액: {total_amount:,}원")

                    await Buy_telegram_async(stockname, order_no, quantity, current_price, total_amount)
                    return True
                else:
                    error_msg = result.get('msg1', '알 수 없는 오류')
                    logger.error(f"❌ {stockname} 리셋 후 매수 주문 실패: {error_msg}")
                    await BUY_ERROR()
            else:
                await BUY_API_ERROR()
                logger.error(f"❌ {stockname} 리셋 후 매수 주문 API 에러: {response.status_code}")
            
            return False
            
        except Exception as e:
            await BUY_API_ERROR()
            logger.error(f"{stockname} 리셋 후 매수 주문 에러: {e}")
            return False

    async def place_buy_order(self, stockname, stock_code, redis_client, order_amount):
        """개선된 매수 주문"""
        try:
            logger.info(f"🔥 {stockname}({stock_code}) 매수 주문 시작")
            
            # 현재가 조회
            current_price = await self.get_current_price(stock_code, redis_client)
            if not current_price:
                await PRICE_EROR()
                logger.error(f"{stockname} 현재가 조회 실패")
                return False
            
            # 스마트 주문 수량 계산
            quantity = await self.calculate_smart_order_quantity(stock_code, current_price, order_amount, redis_client)
            if quantity == 0:
                logger.warning(f"{stockname} 주문 수량 0 - 주문 취소")
                return False
            
            logger.info(f"{stockname} 주문 시도: {quantity}주 × {current_price:,}원 = {quantity * current_price:,}원")

            # 매수 주문 실행
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/order-cash"
            headers = await self.get_trading_headers(redis_client, "TTTC0012U")
            
            if not headers:
                await BUY_API_ERROR()
                return False

            order_data = {
                "CANO": self.account_number,
                "ACNT_PRDT_CD": "01",
                "PDNO": stock_code,
                "ORD_DVSN": "01",
                "ORD_QTY": str(quantity),
                "ORD_UNPR": "0",
            }
            
            response = requests.post(url, headers=headers, json=order_data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('rt_cd') == '0':
                    order_no = result.get('output', {}).get('ODNO', '')
                    total_amount = current_price * quantity
                    
                    logger.info(f"✅ {stockname} 매수 주문 성공!")
                    logger.info(f"   주문번호: {order_no}")
                    logger.info(f"   수량: {quantity}주")
                    logger.info(f"   단가: {current_price:,}원")
                    logger.info(f"   총액: {total_amount:,}원")

                    await Buy_telegram_async(stockname, order_no, quantity, current_price, total_amount)
                    return True
                else:
                    error_msg = result.get('msg1', '알 수 없는 오류')
                    logger.error(f"❌ {stockname} 매수 주문 실패: {error_msg}")
                    
                    # 수량 조정 후 재시도 (더 공격적으로)
                    if quantity > 5:
                        # 5주 이상이면 절반으로 줄이기
                        reduced_quantity = quantity // 2
                        logger.info(f"{stockname} 수량 대폭 조정 후 재시도: {quantity}주 → {reduced_quantity}주")
                    elif quantity > 1:
                        # 적은 수량이면 1주씩 줄이기
                        reduced_quantity = quantity - 1
                        logger.info(f"{stockname} 수량 조정 후 재시도: {quantity}주 → {reduced_quantity}주")
                    else:
                        logger.error(f"{stockname} 수량이 1주인데도 실패 - 포기")
                        await BUY_ERROR()
                        return False
                    
                    order_data["ORD_QTY"] = str(reduced_quantity)
                    retry_response = requests.post(url, headers=headers, json=order_data)
                    
                    if retry_response.status_code == 200:
                        retry_result = retry_response.json()
                        if retry_result.get('rt_cd') == '0':
                            order_no = retry_result.get('output', {}).get('ODNO', '')
                            total_amount = current_price * reduced_quantity
                            
                            logger.info(f"✅ {stockname} 재시도 매수 성공!")
                            logger.info(f"   수량: {reduced_quantity}주")
                            logger.info(f"   총액: {total_amount:,}원")
                            
                            await Buy_telegram_async(stockname, order_no, reduced_quantity, current_price, total_amount)
                            return True
                        else:
                            # 재시도도 실패하면 더 줄여서 한번 더
                            if reduced_quantity > 1:
                                final_quantity = max(1, reduced_quantity - 2)
                                logger.info(f"{stockname} 2차 재시도: {reduced_quantity}주 → {final_quantity}주")
                                
                                order_data["ORD_QTY"] = str(final_quantity)
                                final_response = requests.post(url, headers=headers, json=order_data)
                                
                                if final_response.status_code == 200:
                                    final_result = final_response.json()
                                    if final_result.get('rt_cd') == '0':
                                        order_no = final_result.get('output', {}).get('ODNO', '')
                                        total_amount = current_price * final_quantity
                                        
                                        logger.info(f"✅ {stockname} 2차 재시도 매수 성공!")
                                        logger.info(f"   최종수량: {final_quantity}주")
                                        logger.info(f"   총액: {total_amount:,}원")
                                        
                                        await Buy_telegram_async(stockname, order_no, final_quantity, current_price, total_amount)
                                        return True
                    
                    await BUY_ERROR()
            else:
                await BUY_API_ERROR()
                logger.error(f"❌ {stockname} 매수 주문 API 에러: {response.status_code}")
                logger.error(f"응답: {response.text}")
            
            return False
            
        except Exception as e:
            await BUY_API_ERROR()
            logger.error(f"{stockname} 매수 주문 에러: {e}")
            return False
        
    async def place_sell_order(self, stockname, stock_code, redis_client, holding):
        """개선된 매도 주문"""
        try:
            logger.info(f"🔥 {stockname}({stock_code}) 매도 주문 시작")
            
            # 현재가 조회 (수익률 계산용)
            current_price = await self.get_current_price(stock_code, redis_client)
            if not current_price:
                logger.warning(f"{stockname} 현재가 조회 실패 - 매도 진행")
                current_price = holding.get('current_price', 0)
            
            quantity = holding['quantity']
            avg_price = holding.get('avg_price', 0)
            
            logger.info(f"{stockname} 매도 정보:")
            logger.info(f"  보유수량: {quantity}주")
            logger.info(f"  평균단가: {avg_price:,}원")
            logger.info(f"  현재가: {current_price:,}원")
            
            # 매도 주문 실행
            url = f"{self.base_url}/uapi/domestic-stock/v1/trading/order-cash"
            headers = await self.get_trading_headers(redis_client, "TTTC0011U")
            
            if not headers:
                await SEEL_ERROR(stockname)
                return False
            
            order_data = {
                "CANO": self.account_number,
                "ACNT_PRDT_CD": "01",
                "PDNO": stock_code,
                "ORD_DVSN": "01",
                "ORD_QTY": str(quantity),
                "ORD_UNPR": "0",
            }
            
            response = requests.post(url, headers=headers, json=order_data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('rt_cd') == '0':
                    order_no = result.get('output', {}).get('ODNO', '')
                    total_amount = current_price * quantity
                    profit_amount = (current_price - avg_price) * quantity
                    is_profit = profit_amount > 0
                    
                    logger.info(f"✅ {stockname} 매도 주문 성공!")
                    logger.info(f"   주문번호: {order_no}")
                    logger.info(f"   수량: {quantity}주")
                    logger.info(f"   예상총액: {total_amount:,}원")
                    
                    if is_profit:
                        logger.info(f"   🎉 예상수익: +{profit_amount:,}원 ({((current_price/avg_price-1)*100):+.2f}%)")
                        await SELL_telegram_async(stockname, order_no, quantity, current_price, total_amount, profit_amount, True)
                    else:
                        logger.info(f"   😢 예상손실: {profit_amount:,}원 ({((current_price/avg_price-1)*100):+.2f}%)")
                        await SELL_telegram_async(stockname, order_no, quantity, current_price, total_amount, profit_amount, False)
                    
                    return True
                else:
                    error_msg = result.get('msg1', '알 수 없는 오류')
                    logger.error(f"❌ {stockname} 매도 주문 실패: {error_msg}")
                    await SEEL_ERROR(stockname)
            else:
                await SEEL_ERROR(stockname)
                logger.error(f"❌ {stockname} 매도 주문 API 에러: {response.status_code}")
                logger.error(f"응답: {response.text}")
            
            return False
            
        except Exception as e:
            await SEEL_ERROR()
            logger.error(f"{stockname} 매도 주문 에러: {e}")
            return False