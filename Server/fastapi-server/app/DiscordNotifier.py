import asyncio
import logging
from discord.connection import client
from dotenv import load_dotenv
import os
import discord
import sys

# UTF-8 인코딩 설정
if sys.platform == 'win32':
    import locale
    try:
        locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
    except:
        try:
            locale.setlocale(locale.LC_ALL, '')
        except:
            pass

load_dotenv()

logger = logging.getLogger(__name__)


class DiscordNotifierBot:
    def __init__(self, channel_id):
        self.channel_id = int(channel_id)
        self.client = client  # connection.py에서 가져온 client 사용

    async def send_message_async(self, text):
        """비동기 메시지 전송"""
        try:
            channel = self.client.get_channel(self.channel_id)
            if not channel:
                logger.error(f"채널 {self.channel_id}을 찾을 수 없습니다")
                return False
            
            # Discord는 2000자 제한이 있으므로 긴 메시지는 분할
            if len(text) > 2000:
                chunks = [text[i:i+2000] for i in range(0, len(text), 2000)]
                for chunk in chunks:
                    await channel.send(chunk)
            else:
                await channel.send(text)
            
            logger.info("Discord message sent successfully!")
            return True

        except discord.errors.Forbidden as e:
            logger.error(f"Discord permission error: {e}")
            return False
        except Exception as e:
            logger.error(f"Discord send error: {e}")
            return False

    def send_message_sync(self, text):
        """동기 메시지 전송"""
        return asyncio.run(self.send_message_async(text))


async def test_discord_async(stockname, signal_result):
    """CCI+EMA 신호 비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting CCI+EMA Discord notification...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)

    # 신호 타입 결정
    signal_type = ""
    signal_emoji = ""
    signal_message = ""
    signal_color = ""

    if signal_result.get("latest_buy_signal", False):
        signal_type = "매수 신호"
        signal_emoji = "📈"
        signal_message = "🚀 매수 타이밍입니다!"
        signal_color = "🟢"
    elif signal_result.get("latest_sell_signal", False):
        signal_type = "매도 신호"
        signal_emoji = "📉"
        sell_reason = signal_result.get("sell_reason", "")
        if sell_reason == "CCI+EMA":
            signal_message = "💰 CCI+EMA 기준 매도 타이밍입니다!"
        elif sell_reason == "CCI":
            signal_message = "⚡ CCI 기준 매도 타이밍입니다!"
        else:
            signal_message = "💼 매도 타이밍입니다!"
        signal_color = "🔴"
    else:
        signal_type = "모니터링"
        signal_emoji = "👀"
        signal_message = "📊 지표 모니터링 중..."
        signal_color = "🔵"

    # CCI+EMA 상태 표시
    current_cci = signal_result.get("current_cci", 0)
    current_cci_ema = signal_result.get("current_cci_ema", 0)
    thresholds = signal_result.get("thresholds", {})

    # 상태 아이콘 결정
    def get_status_icon(value, buy_threshold, sell_threshold):
        if value <= buy_threshold:
            return "🟢"  # 매수 구간
        elif value >= sell_threshold:
            return "🔴"  # 매도 구간
        else:
            return "🟡"  # 중립 구간

    cci_status = get_status_icon(
        current_cci, -150, thresholds.get("sell_threshold_cci", 200)
    )
    cci_ema_status = get_status_icon(
        current_cci_ema,
        thresholds.get("buy_threshold", -150),
        thresholds.get("sell_threshold_cci_ema", 110),
    )

    # 메시지 작성 (Discord는 HTML 태그 대신 마크다운 사용)
    message = f"""
{signal_color} **CCI+EMA 신호 발생!**

{signal_emoji} **종목정보**
- 종목명: **{stockname}**

🎯 **신호정보**
- 신호: **{signal_type}**

📊 **지표 현황**
- CCI (파란색선): **{current_cci:.2f}** {cci_status}
- CCI+EMA (노란색선): **{current_cci_ema:.2f}** {cci_ema_status}

🎚️ **임계값 설정**
- 매수 기준: **{thresholds.get('buy_threshold', -150)}** 이하
- 매도 기준1: **{thresholds.get('sell_threshold_cci_ema', 110)}** 이상 (CCI+EMA)
- 매도 기준2: **{thresholds.get('sell_threshold_cci', 200)}** 이상 (CCI)

📈 **신호 통계**
- 총 매수 신호: {signal_result.get('buy_signals_count', 0)}회
- 총 매도 신호: {signal_result.get('sell_signals_count', 0)}회

{signal_message}
    """.strip()

    await notifier.send_message_async(message)
    logger.info(f"{stockname} CCI+EMA Discord notification sent!")


async def Buy_discord_async(
    stockname, order_no, quantity, current_price, total_amount, kind
):
    """비동기 Discord 매수 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    # 주식 신호 메시지
    message = f"""
💰 **{kind} 주문 체결!**

📈 **종목정보**
• 종목명: {stockname}

✅ **주문정보**
• 주문번호: **{order_no}**
• 수량: **{quantity:,}주**
• 체결가격: **{current_price:,}원**

🎯 {kind} 완료!
    """.strip()
    await notifier.send_message_async(message)
    logger.info("Discord buy notification completed!")


async def SELL_discord_async(
    stockname, order_no, quantity, current_price, total_amount, profit_amount, is_profit
):
    """비동기 Discord 매도 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    # 수익/손실에 따른 이모지와 메시지
    if is_profit:
        main_emoji = "💸"
        result_emoji = "📈"
        result_text = "수익 실현!"
        profit_text = f"💰 **수익금: +{profit_amount:,}원**"
        closing_message = "🎉 수익 달성! 축하합니다! 🎊"
    else:
        main_emoji = "💔"
        result_emoji = "📉"
        result_text = "손실 확정"
        profit_text = f"😢 **손실금: {profit_amount:,}원**"
        closing_message = "😢 아쉽지만 다음 기회를 노려봅시다! 💪"

    # 수익률 계산
    profit_rate = (
        (profit_amount / (total_amount - profit_amount)) * 100
        if (total_amount - profit_amount) != 0
        else 0
    )
    rate_text = f"📊 **수익률: {profit_rate:+.2f}%**"
    # 주식 신호 메시지
    message = f"""
{main_emoji} **매도 주문 체결!** {result_emoji}

📈 **종목정보**
• 종목명: {stockname}

✅ **주문정보**
• 주문번호: **{order_no}**
• 수량: **{quantity:,}주**
• 체결가격: **{current_price:,}원**
• 총 매도금액: **{total_amount:,}원**

💹 **손익 결과**
{profit_text}
{rate_text}
• 결과: **{result_text}**

🎯 {closing_message}
    """.strip()
    await notifier.send_message_async(message)
    logger.info("Discord sell notification completed!")


async def profit_Balance_check_Discord_batch(stocks_data, summary_data=None, realized_returns=None):
    """포트폴리오 현황 + 실현 수익률 통합 Discord 전송"""
    # 잔고 체크용 별도 채널 ID 사용 (없으면 기본 채널 사용)
    channel_id = os.getenv("DISCORD_BALANCE_CHANNEL_ID") or os.getenv("DISCORD_CHANNEL_ID")
    
    logger.info("Starting async Discord batch notification...")
    
    if not channel_id:
        logger.error("DISCORD_BALANCE_CHANNEL_ID or DISCORD_CHANNEL_ID environment variable not set")
        return
        
    notifier = DiscordNotifierBot(channel_id)
    
    # 메시지 구성
    message = "📊 **투자 현황 리포트**\n\n"
    
    # 1. 실현 수익률 섹션
    if realized_returns and realized_returns["trades"]:
        message += "💰 **실현 매매 수익률** (이번 달)\n"
        for trade in realized_returns["trades"]:
            profit_emoji = "🟢" if trade["수익률"] > 0 else "🔴" if trade["수익률"] < 0 else "⚪"
            message += f"{profit_emoji} {trade['거래일']}: {trade['수익률']:+.2f}% ({trade['실현손익']:+,}원)\n"
        
        message += f"📈 총 실현손익: **{realized_returns['total_profit']:+,}원** ({realized_returns['trade_count']}건)\n\n"
    else:
        message += "💰 **실현 매매 수익률**: 이번 달 매도 거래 없음\n\n"
    
    # 2. 보유 종목 현황
    message += "📈 **보유 종목 현황**\n"
    for i, stock in enumerate(stocks_data, 1):
        if stock['quantity'] > 0:  # 보유 중인 종목만
            # 수익/손실 상태 표시
            if stock['profit_loss'] > 0:
                status_emoji = "🟢"
                status_text = "수익"
            elif stock['profit_loss'] < 0:
                status_emoji = "🔴" 
                status_text = "손실"
            else:
                status_emoji = "⚪"
                status_text = "보합"
            
            message += f"""**{i}. {stock['stock_name']}** ({stock['stock_code']})
📊 {stock['quantity']:,}주 | 평단: {stock['avg_price']:,.0f}원 | 현재: {stock['current_price']:,}원
{status_emoji} {status_text}: {stock['profit_loss']:+,}원 ({stock['profit_rate']:+.2f}%)

"""
    
    # 3. 포트폴리오 요약
    if summary_data:
        total_eval = summary_data['total_eval']
        total_profit = summary_data['total_profit']
        profit_emoji = "🟢" if total_profit > 0 else "🔴" if total_profit < 0 else "⚪"
        
        message += f"""💼 **포트폴리오 요약**
💰 총 평가금액: {total_eval:,}원
{profit_emoji} 총 평가손익: {total_profit:+,}원"""
        
        # 전체 수익률 계산
        if total_eval > 0 and total_profit != 0:
            total_return = (total_profit / (total_eval - total_profit)) * 100
            message += f" ({total_return:+.2f}%)"
    
    await notifier.send_message_async(message.strip())
    logger.info("Discord batch notification completed!")


async def NO_STOCK():
    """비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    message = f"""현재 보유하지 않는 종목입니다!""".strip()
    await notifier.send_message_async(message)
    logger.info("Discord notification completed!")


async def Wallet_No_MOENY(stockname, redis_client, kind):
    """비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    from .wallet import KISAutoTraderWithBalance
    wallet = KISAutoTraderWithBalance()
    available_cash = await wallet.get_available_cash(redis_client)
    
    # 주식 신호 메시지
    message = f"""
🚨 **{kind} 실패 알림** 🚨

📈 **종목명**: {stockname}
💰 **현재 잔액**: {available_cash:,}원
❌ **상태**: {kind} 가능 금액 부족
    """.strip()
    
    await notifier.send_message_async(message)
    logger.info("Discord notification completed!")


async def BUY_ERROR():
    """비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    message = f"""매수하는 과정에서 문제가 생겼습니다.""".strip()
    await notifier.send_message_async(message)
    logger.info("Discord notification completed!")


async def BUY_API_ERROR():
    """비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    message = f"""매수하는 과정에서 API 문제가 생겼습니다.""".strip()
    await notifier.send_message_async(message)
    logger.info("Discord notification completed!")


async def SEEL_ERROR(stockname):
    """비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    message = f"""{stockname}종목을 매도하는 과정에서 문제가 생겼습니다.""".strip()
    await notifier.send_message_async(message)
    logger.info("Discord notification completed!")


async def PRICE_EROR():
    """비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    message = f"""현재가 조회부분에서 에러가 났습니다.""".strip()
    await notifier.send_message_async(message)
    logger.info("Discord notification completed!")


async def WALLET_STOCK():
    """비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    message = f"""이미 보유 중인 종목입니다.""".strip()
    await notifier.send_message_async(message)
    logger.info("Discord notification completed!")


async def COUNT_EROR():
    """비동기 Discord 알림"""
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    logger.info("Starting async Discord test...")

    if not channel_id:
        logger.error("DISCORD_CHANNEL_ID environment variable not set")
        return

    notifier = DiscordNotifierBot(channel_id)
    message = f"""수량 계산 부분에서 에러가 났습니다.""".strip()
    await notifier.send_message_async(message)
    logger.info("Discord notification completed!")