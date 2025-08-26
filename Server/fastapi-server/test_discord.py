import asyncio
import os
import sys
from dotenv import load_dotenv

# UTF-8 인코딩 설정
import locale
locale.setlocale(locale.LC_ALL, '')

# 현재 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# .env 파일 로드
load_dotenv()

async def test_discord_notification():
    """Discord 알림 테스트"""
    
    # Discord 봇 시작
    from discord.connection import start_discord_bot, stop_discord_bot, client
    from app.DiscordNotifier import DiscordNotifierBot
    
    print("Discord bot starting...")
    
    # Discord 봇을 백그라운드에서 시작
    bot_task = asyncio.create_task(start_discord_bot())
    
    # 봇이 준비될 때까지 대기
    await asyncio.sleep(5)
    
    # Discord 알림 테스트
    channel_id = os.getenv("DISCORD_CHANNEL_ID")
    if not channel_id:
        print("ERROR: DISCORD_CHANNEL_ID not set!")
        return
    
    print(f"Sending test message to channel ID {channel_id}...")
    
    notifier = DiscordNotifierBot(channel_id)
    
    # 테스트 메시지들
    test_messages = [
        "🎯 **Discord 알림 테스트**\n\n✅ Discord 봇이 정상적으로 연결되었습니다!",
        
        "📈 **매수 신호 테스트**\n"
        "• 종목명: 삼성전자\n"
        "• 신호: 매수\n"
        "• 현재가: 70,000원\n"
        "🚀 매수 타이밍입니다!",
        
        "💸 **매도 신호 테스트**\n"
        "• 종목명: SK하이닉스\n"
        "• 수익률: +5.25%\n"
        "• 수익금: +52,500원\n"
        "🎉 수익 실현!",
        
        "📊 **포트폴리오 현황 테스트**\n"
        "💰 총 평가금액: 10,000,000원\n"
        "📈 총 평가손익: +250,000원 (+2.50%)\n"
        "✅ 테스트 완료!"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\nSending message {i}/{len(test_messages)}...")
        success = await notifier.send_message_async(message)
        if success:
            print(f"SUCCESS: Message {i} sent!")
        else:
            print(f"FAILED: Message {i} not sent!")
        await asyncio.sleep(2)  # 메시지 간 간격
    
    print("\nAll tests completed!")
    print("Discord 채널을 확인해보세요.")
    
    # 봇 종료
    await stop_discord_bot()
    bot_task.cancel()

if __name__ == "__main__":
    print("=" * 50)
    print("Discord 알림 테스트 시작")
    print("=" * 50)
    
    try:
        asyncio.run(test_discord_notification())
    except KeyboardInterrupt:
        print("\nTest interrupted.")
    except Exception as e:
        print(f"\nERROR during test: {e}")