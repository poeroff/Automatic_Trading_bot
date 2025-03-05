import { Global, Module } from '@nestjs/common';
import { SchedularService } from './schedular.service';
import { SchedularController } from './schedular.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionService } from './SessionService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockData } from 'src/stock-data/entities/stock-datum.entity';
import { TrCode } from 'src/stock-data/entities/tr-code.entity';
import { RedisModule } from 'src/redis/redis.module';

@Global()
@Module({
  imports :[ScheduleModule.forRoot(),TypeOrmModule.forFeature([StockData,TrCode]),RedisModule],
  controllers: [SchedularController],
  providers: [SchedularService,SessionService],
  exports : [SessionService]
})
export class SchedularModule {}
