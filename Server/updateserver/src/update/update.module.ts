import { Module } from '@nestjs/common';
import { UpdateService } from './update.service';
import { UpdateController } from './update.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KoreanStockCode } from 'libs/entity/KoreanStockCode.entity';
import { DayStockData } from 'libs/entity/DayStockData.entity';
import { MonthStockData } from 'libs/entity/MonthStockData.entity';
import { RedisModule } from 'src/redis/redis.module';


@Module({
  imports : [TypeOrmModule.forFeature([KoreanStockCode,DayStockData,MonthStockData]),RedisModule],
  controllers: [UpdateController],
  providers: [UpdateService],
})
export class UpdateModule {}
