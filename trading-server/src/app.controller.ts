import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import Redis from 'ioredis';

@Controller()
export class AppController {
  private redisClient = new Redis({
    host: 'localhost',
    port: 6379,
  });

  // 🔹 Redis에 값 저장 (이벤트 수신)
  @EventPattern('set_key')
  async handleSetKey(data: { key: string; value: string; ttl?: number }) {
    console.log(`📩 Received set_key event: ${data.key} = ${data.value}, TTL: ${data.ttl || 'No Expiry'}`);
  
    if (data.ttl && data.ttl > 0) {
      await this.redisClient.setex(data.key, data.ttl, data.value); // TTL 적용
      console.log(`✅ Saved in Redis: ${data.key} (Expires in ${data.ttl} seconds)`);
    } else {
      await this.redisClient.set(data.key, data.value); // TTL 없음
      console.log(`✅ Saved in Redis: ${data.key} (No Expiry)`);
    }
  }
  

  // 🔹 Redis에서 값 조회 (이벤트 수신)
  @MessagePattern('get_key')
  async handleGetKey(key: string) {
    console.log(`🔍 Received get_key request for key: ${key}`);
    const value = await this.redisClient.get(key);
    console.log(`📦 Retrieved from Redis: ${value}`);
    return value;
  }
}
