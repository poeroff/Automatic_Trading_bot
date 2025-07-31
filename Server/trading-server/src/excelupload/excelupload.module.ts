import { Module } from '@nestjs/common';
import { ExceluploadService } from './excelupload.service';
import { ExceluploadController } from './excelupload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { RedisModule } from 'src/redis/redis.module';
import { DayStockData } from 'src/stock-data/entities/DayStockData.entity';
import { MonthStockData } from 'src/stock-data/entities/MonthStockData.entity';

@Module({
  imports :[TypeOrmModule.forFeature([KoreanStockCode,DayStockData,MonthStockData]),RedisModule],
  controllers: [ExceluploadController],
  providers: [ExceluploadService],
})
export class ExceluploadModule {}
