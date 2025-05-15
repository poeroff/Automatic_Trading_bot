import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import Redis from 'ioredis';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('REDIS_CLIENT') private readonly redisClient: ClientProxy) {}

  private redisClients = new Redis({
    host: "redis" ,
    port: 6379,
  });

  // 🔹 Redis에 값 저장 (이벤트 수신)
  @EventPattern('set_key')
  async handleSetKey(data: { key: string; value: string; ttl?: number }) {
    if (data.ttl && data.ttl > 0) {
      await this.redisClients.setex(data.key, data.ttl, data.value); // TTL 적용
    } else {
      await this.redisClients.set(data.key, data.value); // TTL 없음
    }
  }
  // 🔹 Redis에서 값 조회 (이벤트 수신)
  @MessagePattern('get_key')
  async handleGetKey(key: string) {
    const value = await this.redisClients.get(key);
    return value;
  }
  
  @Get()
  getHello(): string {
    console.log("HELLO")
    this.redisClient.emit('set_key', { key: "AuthHashKey", value: "123", ttl: 86400 });
    return this.appService.getHello();
  }
}
