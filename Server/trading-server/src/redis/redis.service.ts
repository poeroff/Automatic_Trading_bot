import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: ClientProxy) {}

  // 🔹 Redis에 값 저장 (이벤트 전송)
  async setKey(key: string, value: string) {
    return this.redisClient.emit('set_key', { key, value });
  }

  // 🔹 Redis에서 값 조회 (이벤트 요청 후 응답 받기)
  async getKey(key: string) {
    return this.redisClient.send('get_key', key).toPromise();
  }
}
