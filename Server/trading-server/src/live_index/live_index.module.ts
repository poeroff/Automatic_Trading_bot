import { Module } from '@nestjs/common';
import { LiveIndexService } from './live_index.service';
import { LiveIndexController } from './live_index..controller';

import { RedisModule } from 'src/redis/redis.module';


@Module({
  imports: [RedisModule],
  controllers: [LiveIndexController],
  providers: [LiveIndexService],
  exports: [LiveIndexService],
  
})
export class LiveIndexModule {}
