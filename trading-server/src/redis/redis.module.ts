import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports:[ ClientsModule.register([
    {
      name: 'REDIS_CLIENT',
      transport: Transport.REDIS,
      options: { host: "redis" , port: 6379 },
    },
  ]),],
  controllers: [RedisController],
  providers: [RedisService],
  exports : [ClientsModule],
})
export class RedisModule {}
