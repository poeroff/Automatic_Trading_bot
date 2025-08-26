
import logging
import os
from datetime import timedelta, datetime, time
import time as time_module 
from numpy import number
from fastapi import APIRouter, Request, HTTPException
from app.database import execute_query
from pyampd.ampd import find_peaks
import pandas as pd
import asyncio
import redis.asyncio as redis
import requests
from dotenv import load_dotenv
from ..EMA import MACrossSignalDetector
from ..CCIEMADetector import CCIEMAStochRSIDetector
from ..Trader import KISAutoTrader
from ..wallet import KISAutoTraderWithBalance
from ..DiscordNotifier import test_discord_async,profit_Balance_check_Discord_batch,Wallet_No_MOENY
import requests


load_dotenv() 

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/schedule", tags=["schedule"])

async def get_kis_headers(redis_client):
    """Redis에서 토큰을 가져와서 KIS API 헤더 생성"""
    try:
        access_token = await redis_client.get("AccessToken")
        app_key = os.getenv("appkey")  # .env 파일에 맞게 소문자 사용
        app_secret = os.getenv("appsecret")  # .env 파일에 맞게 소문자 사용

        if not access_token:
            logger.error("Access token not found in Redis")
            return None
        
        if not app_key or not app_secret:
            logger.error("appkey or appsecret not found in environment variables")
            return None
        
        # 토큰이 이미 Bearer를 포함하고 있는지 확인
        auth_header = access_token
        if not access_token.startswith("Bearer "):
            auth_header = f"Bearer {access_token}"
            
        return {
            "Content-Type": "application/json",
            "authorization": auth_header,  # Bearer 처리
            "appkey": app_key,
            "appsecret": app_secret,
            "tr_id": "FHKST03010100",  # 일봉 데이터용 정확한 tr_id
            "custtype": "P"
        }
    except Exception as e:
        logger.error(f"Error creating headers: {e}")
        return None

def get_stock_list(result):
    """DB 결과를 주식 리스트로 변환"""
    stocks = []  
    if result:
        for row in result:
            stocks.append({
                'code': row["code"],
                'name': row["company"],
                'market': row["mket_id_cd"]
            })
        logger.info(f"총 {len(stocks)}개 주식 데이터 변환 완료")
        return stocks
    else:
        logger.warning("조회된 데이터가 없습니다.")
        return []

async def get_daily_price(stock_code, redis_client, required_data_count=100):
    """
    일봉 데이터 조회 - 필요한 데이터 개수를 보장하도록 개선 (API 호출 제한 고려)
    """
    logger.info(f"=== get_daily_price 함수 진입: {stock_code} (목표: {required_data_count}개) ===")
    
    url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice"
    
    headers = await get_kis_headers(redis_client)
    
    if not headers:
        logger.error("헤더 생성 실패")
        return None

    # 거래일 기준으로 충분한 기간 설정 (주말/공휴일 고려하여 1.5배)
    estimated_calendar_days = int(required_data_count * 1.5)
    max_attempts = 3
    
    for attempt in range(max_attempts):
        try:
            # 재시도 시에만 딜레이
            if attempt > 0:
                logger.info(f"재시도 전 대기: 0.5초")
                await asyncio.sleep(0.5)
            
            # 조회 기간 설정
            end_date = datetime.now().strftime("%Y%m%d")
            start_date = (datetime.now() - timedelta(days=estimated_calendar_days)).strftime("%Y%m%d")
            
            logger.info(f"시도 {attempt + 1}: {start_date} ~ {end_date} ({estimated_calendar_days}일)")

            params = {
                "FID_COND_MRKT_DIV_CODE": "J",
                "FID_INPUT_ISCD": stock_code,
                "FID_PERIOD_DIV_CODE": "D",
                "FID_ORG_ADJ_PRC": "1",
                "FID_INPUT_DATE_1": start_date,
                "FID_INPUT_DATE_2": end_date
            }
            
            # API 호출 시간 기록
            response = requests.get(url, headers=headers, params=params)
         
            

            
            if response.status_code == 200:
                data = response.json()

                if 'output2' in data and data['output2']:
                    df = pd.DataFrame(data['output2'])
                    if not df.empty:
                        # 컬럼명 정리 및 데이터 타입 변환
                        df['close'] = pd.to_numeric(df['stck_clpr'])
                        df['high'] = pd.to_numeric(df['stck_hgpr'])
                        df['low'] = pd.to_numeric(df['stck_lwpr'])
                        df['date'] = pd.to_datetime(df['stck_bsop_date'])
                        df = df.sort_values('date').reset_index(drop=True)
                        
                        actual_count = len(df)
                        logger.info(f"{stock_code} 일봉 데이터 {actual_count}개 조회 완료")
                        
                        # 필요한 데이터 개수를 만족하는지 확인
                        if actual_count >= required_data_count:
                            logger.info(f"✅ 목표 달성: {actual_count}개 >= {required_data_count}개")
                            return df[['date', 'high', 'low', 'close']]
                        elif actual_count >= required_data_count * 0.8:  # 80% 이상이면 허용
                            logger.warning(f"⚠️ 목표 미달이지만 사용: {actual_count}개 (목표: {required_data_count}개)")
                            return df[['date', 'high', 'low', 'close']]
                        else:
                            # 데이터가 부족하면 기간을 늘려서 재시도
                            estimated_calendar_days = int(estimated_calendar_days * 1.5)
                            logger.warning(f"🔄 데이터 부족으로 재시도: {actual_count}개 < {required_data_count}개")
                            continue
                else:
                    logger.warning(f"{stock_code} - API 응답에 데이터 없음")
                    if 'msg1' in data:
                        logger.warning(f"API 메시지: {data['msg1']}")
                    break
                    
            elif response.status_code == 429:  # Too Many Requests
                logger.warning(f"{stock_code} - API 호출 제한 초과, 추가 대기")
                await asyncio.sleep(0.5)
                continue
                
            else:
                logger.error(f"{stock_code} - API 에러: {response.status_code}")
                logger.error(f"응답 내용: {response.text}")
                break
                
        except Exception as e:
            logger.error(f"{stock_code} - API 호출 중 에러: {e}")
            break
    
    logger.error(f"{stock_code} - 데이터 조회 실패")
    return None


# 1) 실제 DB 작업 로직 함수
# 1) 올바르게 수정된 함수
async def day_find_freak_update_logic(pool, redis_client):
    logger.info("=== 주식 자동매매 반복 실행 시작 ===")
    try:
        end_time = time(15, 20)  # 오후 3시 20분
        cycle_count = 0
        
        logger.info(f"종료 시간: {end_time}")
        
        while datetime.now().time() < end_time:
            cycle_count += 1
            current_time = datetime.now().time()
            
            logger.info(f"=== {cycle_count}번째 사이클 시작 (현재시간: {current_time}) ===")
            
            # 한 사이클의 실행 결과를 저장할 변수
            cycle_success = False
            
            try:
                logger.info("=== day_find_freak_update_logic 사이클 시작 ===")

                # 이동평균 크로스 감지기 초기화
                ma_detector = MACrossSignalDetector(length=7, confirm_bars=1)
                cci_detector = CCIEMAStochRSIDetector()
                auto_trader = KISAutoTrader()
                trader = KISAutoTraderWithBalance()

                sql = "SELECT * FROM stock.koreanstockcode"
                result = await execute_query(sql, pool=pool)
                logger.info(f"DB 쿼리 결과: {len(result) if result else 0}개")
                
                stocks = get_stock_list(result)
                total = len(stocks)
                logger.info(f"총 {total}개 주식 처리 시작")

                for i, stock in enumerate(stocks): 
                    try:
                        logger.info(f"진행률: {i+1}/{total} - {stock['name']} ({stock['code']}) 분석중...")
                        
                        # 일봉 데이터 가져오기
                        df = await get_daily_price(stock['code'], redis_client)
                        
                        if df is not None and len(df) > 20:
                            logger.info(f"{stock['name']} - 데이터 조회 성공, {len(df)}개 레코드")
                            
                            # 이동평균 크로스 신호 계산
                            signal_result = cci_detector.calculate_cci_ema_stochrsi_signal(df)
                            if signal_result and signal_result['success']:
                               
                                # 실제 거래 실행
                               
                                if signal_result['latest_buy_signal']:
                                    await trader.place_buy_order_with_check(stock['name'], stock['code'], redis_client,  order_amount=500000 , kind ="매수")
                                elif signal_result['latest_sell_signal'] or signal_result['latest_stop_loss_signal']:  
                                    logger.info(f"{stock['name']} - 매도 신호 감지됨")
                                    await trader.place_sell_order_with_check(
                                            stock['name'], stock['code'], redis_client
                                    )
                            else:
                                logger.info(f"{stock['name']} - 신호 없음")
                                if signal_result:
                                    logger.info(f"   현재 상태 - 가격: {signal_result['price']:.2f}, MA: {signal_result['ma']:.2f}")
                                    logger.info(f"   bcount: {signal_result['bcount']}, scount: {signal_result['scount']}")
                        else:
                            logger.warning(f"{stock['name']} - 데이터 조회 실패 또는 데이터 부족")
                            
                        # API 제한 고려하여 딜레이
                        await asyncio.sleep(0.5)
                        
                    except Exception as e:
                        logger.error(f"에러 발생 {stock['name']}: {e}")
                        continue
                
                # 한 사이클 완료
                cycle_success = True
                logger.info(f"=== {cycle_count}번째 사이클 완료 ===")
                
            except Exception as e:
                logger.error(f"Cycle {cycle_count} error: {e}")
                cycle_success = False

            # 🔧 이 부분이 핵심! 다음 사이클까지 대기
            if datetime.now().time() < end_time:
                wait_minutes = 3  # 10분 대기
                logger.info(f"{wait_minutes}분 후 다음 사이클 실행...")
                
                # 대기 중에도 종료 시간 체크
                for i in range(wait_minutes * 60):  # 60초 * 10분 = 600초
                    if datetime.now().time() >= end_time:
                        logger.info(f"대기 중 종료 시간({end_time})에 도달. 반복 종료.")
                        break
                    await asyncio.sleep(1)  # 1초씩 대기하면서 시간 체크
            else:
                # 종료 시간에 도달했으므로 while 루프 종료
                logger.info(f"종료 시간 도달, while 루프 종료")
                break

        # while 루프가 끝난 후 (정상적인 종료)
        logger.info(f"종료 시간({end_time}) 도달. 총 {cycle_count}번의 사이클 실행 완료")
        return True
        
    except Exception as e:
        logger.error(f"Main loop error: {e}")
        return False
    
async def Balance_check(pool, redis_client):
   
    trader = KISAutoTraderWithBalance()
    
    # 기간별 수익률과 현재 잔고 조회
    profit_result = await trader.profit(redis_client)
 
    result = await trader.get_account_balance(redis_client)
        
    if result and 'output1' in result:
        logger.info("=== 📊 현재 보유 종목 현황 ===")
        
        # 보유 종목 데이터 수집
        stocks_data = []
        for i, stock in enumerate(result['output1'], 1):
            stock_data = {
                'stock_code': stock['pdno'],
                'stock_name': stock['prdt_name'],
                'quantity': int(stock['hldg_qty']),
                'avg_price': float(stock['pchs_avg_pric']),
                'current_price': int(stock['prpr']),
                'profit_loss': int(stock['evlu_pfls_amt']),
                'profit_rate': float(stock['evlu_pfls_rt'])
            }
            stocks_data.append(stock_data)
            
            # -15% 이하시 추가매수
            if float(stock['evlu_pfls_rt']) <= -15:
                await trader.add_buy_order_with_check(
                    stock['prdt_name'], stock['pdno'], redis_client, 
                    order_amount=500000, kind="추가매수"
                )
        
        # 포트폴리오 요약 데이터
        summary_data = None
        if 'output2' in result and result['output2']:
            summary = result['output2'][0]
            summary_data = {
                'total_eval': int(summary['tot_evlu_amt']),
                'total_profit': int(summary['evlu_pfls_smtl_amt'])
            }
        
        # 실현 수익률 분석
        realized_returns = analyze_realized_profit(profit_result) if profit_result else None
        
        # 수익률 순 정렬
        stocks_data.sort(key=lambda x: x['profit_rate'], reverse=True)
        
        # 텔레그램 통합 전송
        await profit_Balance_check_Discord_batch(stocks_data, summary_data, realized_returns)
        
        # 로그 출력
        for stock_data in stocks_data:
            logger.info(f"{stock_data['stock_name']}: {stock_data['profit_loss']:+,}원 ({stock_data['profit_rate']:+.2f}%)")
        
        if summary_data:
            logger.info("=== 💰 포트폴리오 요약 ===")
            logger.info(f"총 평가금액: {summary_data['total_eval']:,}원")
            logger.info(f"총 손익: {summary_data['total_profit']:,}원")
            logger.info("=======================")
    else:
        logger.error("❌ 계좌 잔고 조회 실패")
    
    return True

def analyze_realized_profit(profit_result):
    """기간별 수익률 데이터에서 실현 수익률 분석"""
    try:
        if not profit_result or 'output1' not in profit_result:
            return None
            
        trades = profit_result['output1']
        realized_trades = []
        total_realized_profit = 0
    
        
        for trade in trades:
            # 매도가 발생한 거래만 필터링
            sll_amt = int(trade.get('sll_amt', 0))
            if sll_amt > 0:
                rlzt_pfls = int(trade.get('rlzt_pfls', 0))  # 그대로 원 단위
                pfls_rt = float(trade.get('pfls_rt', 0))
                
                realized_trade = {
                    "거래일": trade.get('trad_dt', ''),
                    "매도금액": sll_amt,       # 100,300원
                    "매도수량": int(trade.get('sll_qty1', 0)),  # 68주
                    "실현손익": rlzt_pfls,     # 1,313원 (실제 원 단위)
                    "수익률": pfls_rt          # 1.33%
                }
                realized_trades.append(realized_trade)
                total_realized_profit += rlzt_pfls  # 1,313원 그대로 합산
        
        return {
            "trades": realized_trades,
            "total_profit": total_realized_profit,  # 실제 원 단위 총합
            "trade_count": len(realized_trades)
        } if realized_trades else None
        
    except Exception as e:
        logger.error(f"실현 수익률 분석 에러: {e}")
        return None


# 2) FastAPI 라우터 핸들러
@router.get("/DayFindFeakUpdate")
async def day_find_freak_update_endpoint(request: Request):
    logger.info("=== API 엔드포인트 호출됨 ===")
    
    try:
        # DB Pool과 Redis 클라이언트 가져오기
        db_pool = request.app.state.db_pool
        redis_client = request.app.state.redis_client
        
        logger.info("DB Pool과 Redis 클라이언트 획득 완료")
        
        # Redis 연결 테스트
        test_token = await redis_client.get("AccessToken")
        logger.info(f"Redis 연결 테스트 - Token 존재: {bool(test_token)}")
        
        data = await day_find_freak_update_logic(db_pool, redis_client)
        
        logger.info(f"API 응답 데이터: {data['stocks_processed']}개 처리, {data['signals_found']}개 신호")
        return {"data": data, "status": "success"}
        
    except Exception as e:
        logger.error(f"API 엔드포인트 에러: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

# 3) 스케줄러용 함수 (main.py에서 호출)
async def scheduled_day_find_freak_update(app):
    """스케줄러에서 호출하는 함수"""
    try:
        logger.info("=== 스케줄 작업 시작 ===")
        db_pool = app.state.db_pool
        redis_client = app.state.redis_client
        
        result = await day_find_freak_update_logic(db_pool, redis_client)
        logger.info(f"=== 스케줄 작업 완료: {result['stocks_processed']}개 처리, {result['signals_found']}개 신호 ===")
        
    except Exception as e:
        logger.error(f"스케줄 작업 에러: {e}")