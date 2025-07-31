import asyncio
import datetime
import logging
from telegram import Bot
from telegram.error import TelegramError

from dotenv import load_dotenv
import os

load_dotenv()


logger = logging.getLogger(__name__)


class TelegramNotifierBot:
    def __init__(self, bot_token, chat_id):
        self.bot = Bot(token=bot_token)
        self.chat_id = chat_id

    async def send_message_async(self, text, parse_mode="HTML"):
        """비동기 메시지 전송"""
        try:
            await self.bot.send_message(
                chat_id=self.chat_id, text=text, parse_mode=parse_mode
            )
            print("✅ 메시지 전송 성공!")
            return True

        except TelegramError as e:
            print(f"❌ 텔레그램 에러: {e}")
            return False
        except Exception as e:
            print(f"❌ 일반 에러: {e}")
            return False

    def send_message_sync(self, text, parse_mode="HTML"):
        """동기 메시지 전송"""
        return asyncio.run(self.send_message_async(text, parse_mode))


async def test_telegram_async(stockname, signal_result):
    """CCI+EMA 신호 비동기 텔레그램 알림"""
    bot_token = os.getenv("bot_token")
    chat_id = os.getenv("chat_id")

    print("🧪 CCI+EMA 텔레그램 알림 시작...")

    if TelegramNotifierBot:
        notifier = TelegramNotifierBot(bot_token, chat_id)

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

        # 메시지 작성
        message = f"""
{signal_color} <b>CCI+EMA 신호 발생!</b>

{signal_emoji} <b>종목정보</b>
- 종목명: <b>{stockname}</b>

🎯 <b>신호정보</b>
- 신호: <b>{signal_type}</b>

📊 <b>지표 현황</b>
- CCI (파란색선): <b>{current_cci:.2f}</b> {cci_status}
- CCI+EMA (노란색선): <b>{current_cci_ema:.2f}</b> {cci_ema_status}

🎚️ <b>임계값 설정</b>
- 매수 기준: <b>{thresholds.get('buy_threshold', -150)}</b> 이하
- 매도 기준1: <b>{thresholds.get('sell_threshold_cci_ema', 110)}</b> 이상 (CCI+EMA)
- 매도 기준2: <b>{thresholds.get('sell_threshold_cci', 200)}</b> 이상 (CCI)

📈 <b>신호 통계</b>
- 총 매수 신호: {signal_result.get('buy_signals_count', 0)}회
- 총 매도 신호: {signal_result.get('sell_signals_count', 0)}회

⏰ <b>발생시간:</b> {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

{signal_message}
        """.strip()

        await notifier.send_message_async(message)
        print(f"🎉 {stockname} CCI+EMA 알림 전송 완료!")
    else:
        print("❌ python-telegram-bot 라이브러리가 필요합니다")


async def Buy_telegram_async(
    stockname, order_no, quantity, current_price, total_amount
):
    """비동기 텔레그램 테스트"""
    bot_token = os.getenv("bot_token")
    chat_id = os.getenv("chat_id")

    print("🧪 비동기 텔레그램 테스트 시작...")

    if TelegramNotifierBot:
        notifier = TelegramNotifierBot(bot_token, chat_id)
        # 주식 신호 메시지
        message = f"""
            💰 <b>매수 주문 체결!</b>

            📈 <b>종목정보</b>
            • 종목명: {stockname}

            ✅ <b>주문정보</b>
            • 주문번호: <b>{order_no}</b>
            • 수량: <b>{quantity:,}주</b>
            • 체결가격: <b>{current_price:,}원</b>
            • 총 투자금액: <b>{total_amount:,}원</b>

            ⏰ 체결시간: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

            🎯 매수 완료! 수익 실현을 기대해봅시다! 📊
            """.strip()
        await notifier.send_message_async(message)
        print("🎉 비동기 테스트 완료!")
    else:
        print("❌ python-telegram-bot 라이브러리가 필요합니다")


async def SELL_telegram_async(
    stockname, order_no, quantity, current_price, total_amount, profit_amount, is_profit
):
    """비동기 텔레그램 테스트"""
    bot_token = os.getenv("bot_token")
    chat_id = os.getenv("chat_id")

    print("🧪 비동기 텔레그램 테스트 시작...")

    if TelegramNotifierBot:
        notifier = TelegramNotifierBot(bot_token, chat_id)
        # 수익/손실에 따른 이모지와 메시지
        if is_profit:
            main_emoji = "💸"
            result_emoji = "📈"
            result_text = "수익 실현!"
            profit_text = f"💰 <b>수익금: +{profit_amount:,}원</b>"
            closing_message = "🎉 수익 달성! 축하합니다! 🎊"
        else:
            main_emoji = "💔"
            result_emoji = "📉"
            result_text = "손실 확정"
            profit_text = f"😢 <b>손실금: {profit_amount:,}원</b>"
            closing_message = "😢 아쉽지만 다음 기회를 노려봅시다! 💪"

        # 수익률 계산
        profit_rate = (
            (profit_amount / (total_amount - profit_amount)) * 100
            if (total_amount - profit_amount) != 0
            else 0
        )
        rate_text = f"📊 <b>수익률: {profit_rate:+.2f}%</b>"
        # 주식 신호 메시지
        message = f"""
            {main_emoji} <b>매도 주문 체결!</b> {result_emoji}

            📈 <b>종목정보</b>
            • 종목명: {stockname}

            ✅ <b>주문정보</b>
            • 주문번호: <b>{order_no}</b>
            • 수량: <b>{quantity:,}주</b>
            • 체결가격: <b>{current_price:,}원</b>
            • 총 매도금액: <b>{total_amount:,}원</b>

            💹 <b>손익 결과</b>
            {profit_text}
            {rate_text}
            • 결과: <b>{result_text}</b>

            ⏰ 체결시간: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

            🎯 {closing_message}
                    """.strip()
        await notifier.send_message_async(message)
        print("🎉 비동기 테스트 완료!")
    else:
        print("❌ python-telegram-bot 라이브러리가 필요합니다")



async def Wallet_No_MOENY():
    """비동기 텔레그램 테스트"""
    bot_token = os.getenv("bot_token")
    chat_id = os.getenv("chat_id")

    print("🧪 비동기 텔레그램 테스트 시작...")

    if TelegramNotifierBot:
        notifier = TelegramNotifierBot(bot_token, chat_id)
        # 수익/손실에 따른 이모지와 메시지
        
        # 주식 신호 메시지
        message = f"""현재 지갑에 잔액이 없습니다""".strip()
        await notifier.send_message_async(message)
        print("🎉 비동기 테스트 완료!")
    else:
        print("❌ python-telegram-bot 라이브러리가 필요합니다")

async def NO_STOCK():
    """비동기 텔레그램 테스트"""
    bot_token = "8427797627:AAHcjJNciO_DJYyjK4gby5WJFGBc9fs4N9k"
    chat_id = 7103296678

    print("🧪 비동기 텔레그램 테스트 시작...")

    if TelegramNotifierBot:
        notifier = TelegramNotifierBot(bot_token, chat_id)
        # 수익/손실에 따른 이모지와 메시지
        
        # 주식 신호 메시지
        message = f"""현재 보유하지 않는 종목입니다!""".strip()
        await notifier.send_message_async(message)
        print("🎉 비동기 테스트 완료!")
    else:
        print("❌ python-telegram-bot 라이브러리가 필요합니다")
