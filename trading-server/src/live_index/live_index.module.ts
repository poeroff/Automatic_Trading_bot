import { Module } from '@nestjs/common';
import { LiveIndexService } from './live_index.service';
import { LiveIndexController } from './live_index..controller';
import { SessionService } from 'src/schedular/SessionService';
import { SchedularModule } from 'src/schedular/schedular.module';
import { RedisModule } from 'src/redis/redis.module';


@Module({
  imports: [SchedularModule,RedisModule],
  controllers: [LiveIndexController],
  providers: [LiveIndexService],
  exports: [LiveIndexService],
  
})
export class LiveIndexModule {}
