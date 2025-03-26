import { Module } from '@nestjs/common';
import { StockDataService } from './stock-data.service';
import { StockDataController } from './stock-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayStockData } from './entities/DayStockData.entity';
import { TrCode } from './entities/tr-code.entity';
import { PeakDate } from './entities/PeakDate.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/filtered-peaks.entity';
import { UserInflection } from './entities/user-inflection.entity';
import { KoreanStockCode } from './entities/KoreanStockCode.entity';
import { WeekStockData } from './entities/WeekStockData.entity';


@Module({
  imports: [TypeOrmModule.forFeature([DayStockData,TrCode,PeakDate,PeakPrice,FilteredPeak,UserInflection,KoreanStockCode,WeekStockData])],
  controllers: [StockDataController],
  providers: [StockDataService],
})
export class StockDataModule {}
