import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from 'src/stock-data/entities/Alert.entity';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { EventsGateway } from 'src/gateway/events.gateway';
import { LiveIndexModule } from 'src/live_index/live_index.module';
import { RedisModule } from 'src/redis/redis.module';



@Module({
  imports : [TypeOrmModule.forFeature([Alert,KoreanStockCode]),LiveIndexModule,RedisModule],
  controllers: [SignalsController],
  providers: [SignalsService,EventsGateway],
})
export class SignalsModule {}
