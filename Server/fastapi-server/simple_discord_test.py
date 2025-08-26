import discord
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'Bot logged in as {client.user}')
    print(f'Connected to {len(client.guilds)} servers')
    
    # List all servers and channels
    for guild in client.guilds:
        print(f'\nServer: {guild.name} (ID: {guild.id})')
        print('Text Channels:')
        for channel in guild.text_channels:
            print(f'  - {channel.name} (ID: {channel.id})')
    
    # Try to send test message
    channel_id = int(os.getenv("DISCORD_CHANNEL_ID"))
    channel = client.get_channel(channel_id)
    
    if channel:
        print(f'\nFound channel with ID {channel_id}')
        print(f'Channel name: {channel.name}')
        
        try:
            await channel.send("**Discord Alert Test**\n\nThis is a test message from the trading bot!")
            print('Test message sent successfully!')
        except discord.errors.Forbidden:
            print('ERROR: Bot does not have permission to send messages in this channel')
        except Exception as e:
            print(f'ERROR sending message: {e}')
    else:
        print(f'\nERROR: Could not find channel with ID {channel_id}')
        print('Available channel IDs:')
        for guild in client.guilds:
            for channel in guild.text_channels:
                print(f'  {channel.id} - {channel.name}')
    
    # Close the bot after testing
    await asyncio.sleep(2)
    await client.close()

# Run the bot
token = os.getenv('DISCORD_TOKEN')
if token:
    # Remove quotes if present
    token = token.strip('"')
    print('Starting Discord bot...')
    try:
        client.run(token)
    except Exception as e:
        print(f'Error running bot: {e}')
else:
    print("Discord token not found in .env file")