import { Controller, Get, Post, Query } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  // 🔹 Redis에 값 저장
  @Post('set')
  async setKey(@Query('key') key: string, @Query('value') value: string) {
    await this.redisService.setKey(key, value);
    return { message: `Key '${key}' has been set.` };
  }

  // 🔹 Redis에서 값 조회
  @Get('get')
  async getKey(@Query('key') key: string) {
    const value = await this.redisService.getKey(key);
    return value ? { key, value } : { message: 'Key not found' };
  }
}
