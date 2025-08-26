# ========================================
import discord
import os
from dotenv import load_dotenv
import asyncio
import logging

# .env 파일에서 환경 변수 로드
load_dotenv()

logger = logging.getLogger(__name__)

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    logger.info(f'봇이 성공적으로 로그인했습니다: {client.user}')
    
    # 서버 수 출력
    logger.info(f'연결된 서버 수: {len(client.guilds)}')
    
    # 연결된 서버 목록
    for guild in client.guilds:
        logger.info(f'- {guild.name} (ID: {guild.id})')

async def start_discord_bot():
    """Discord 봇을 비동기로 시작"""
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        logger.error("Discord 토큰이 설정되지 않았습니다!")
        return None
    
    try:
        # 백그라운드 태스크로 봇 실행
        await client.start(token)
    except Exception as e:
        logger.error(f"Discord 봇 시작 실패: {e}")
        return None

async def stop_discord_bot():
    """Discord 봇 연결 종료"""
    if client and not client.is_closed():
        await client.close()
        logger.info("Discord 봇 연결 종료")

