import { Module } from '@nestjs/common';
import { StockRankingsService } from './stock-rankings.service';
import { StockRankingsController } from './stock-rankings.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports:[RedisModule],
  controllers: [StockRankingsController],
  providers: [StockRankingsService],
})
export class StockRankingsModule {}
