import { Module } from '@nestjs/common';
import { ExceluploadService } from './excelupload.service';
import { ExceluploadController } from './excelupload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { RedisModule } from 'src/redis/redis.module';
import { DayStockData } from 'src/stock-data/entities/DayStockData.entity';
import { WeekStockData } from 'src/stock-data/entities/WeekStockData.entity';
import { MonthStockData } from 'src/stock-data/entities/MonthStockData.entity';

@Module({
  imports :[TypeOrmModule.forFeature([KoreanStockCode,DayStockData,WeekStockData,MonthStockData]),RedisModule],
  controllers: [ExceluploadController],
  providers: [ExceluploadService],
})
export class ExceluploadModule {}
