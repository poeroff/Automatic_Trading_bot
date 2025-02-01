import { Module } from '@nestjs/common';
import { StockDataService } from './stock-data.service';
import { StockDataController } from './stock-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockData } from './entities/stock-datum.entity';
import { TrCode } from './entities/tr-code.entity';
import { PeakDate } from './entities/peak-dates.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/filtered-peaks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockData,TrCode,PeakDate,PeakPrice,FilteredPeak])],
  controllers: [StockDataController],
  providers: [StockDataService],
})
export class StockDataModule {}
