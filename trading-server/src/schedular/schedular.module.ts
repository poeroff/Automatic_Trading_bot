import { Global, Module } from '@nestjs/common';
import { SchedularService } from './schedular.service';
import { SchedularController } from './schedular.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionService } from './SessionService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayStockData } from 'src/stock-data/entities/DayStockData.entity';

import { RedisModule } from 'src/redis/redis.module';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { WeekStockData } from 'src/stock-data/entities/WeekStockData.entity';

@Global()
@Module({
  imports :[ScheduleModule.forRoot(),TypeOrmModule.forFeature([DayStockData,KoreanStockCode,WeekStockData]),RedisModule],
  controllers: [SchedularController],
  providers: [SchedularService,SessionService],
  exports : [SessionService]
})
export class SchedularModule {}
