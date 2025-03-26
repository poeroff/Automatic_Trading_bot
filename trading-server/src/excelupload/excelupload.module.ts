import { Module } from '@nestjs/common';
import { ExceluploadService } from './excelupload.service';
import { ExceluploadController } from './excelupload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';

@Module({
  imports :[TypeOrmModule.forFeature([KoreanStockCode])],
  controllers: [ExceluploadController],
  providers: [ExceluploadService],
})
export class ExceluploadModule {}
