import { Controller, Get } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import Redis from 'ioredis';

@Controller()
export class AppController {

  @Get("HELLO")
  HELLO(){
    return "HELLOWORLD"
  }
  private redisClient = new Redis({
    host: "redis" ,
    port: 6379,
  });

  // 🔹 Redis에 값 저장 (이벤트 수신)
  @EventPattern('set_key')
  async handleSetKey(data: { key: string; value: string; ttl?: number }) {
    if (data.ttl && data.ttl > 0) {
      await this.redisClient.setex(data.key, data.ttl, data.value); // TTL 적용
    } else {
      await this.redisClient.set(data.key, data.value); // TTL 없음
    }
  }
  // 🔹 Redis에서 값 조회 (이벤트 수신)
  @MessagePattern('get_key')
  async handleGetKey(key: string) {
    const value = await this.redisClient.get(key);
    return value;
  }

  @MessagePattern('process_task') // 이 이름은 서버 A와 반드시 일치해야 함
  handleTask(data: any) {
    console.log('📥 서버 B에서 처리할 데이터:', data);
    return { result: `처리 완료: ${data.input}` };
  }
}
