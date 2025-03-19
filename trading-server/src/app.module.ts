import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockDataModule } from './stock-data/stock-data.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DayStockData } from './stock-data/entities/DayStockData.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TrCode } from './stock-data/entities/tr-code.entity';
import * as Joi from 'joi';
import { PeakPrice } from './stock-data/entities/PeakPrice.entity';
import { FilteredPeak } from './stock-data/entities/filtered-peaks.entity';
import { PeakDate } from './stock-data/entities/peak-dates.entity';
import { UserInflection } from './stock-data/entities/user-inflection.entity';
import { SchedularModule } from './schedular/schedular.module';
import { SessionModule } from 'nestjs-session';
import { LiveIndexModule } from './live_index/live_index.module';
import { GatewayModule } from './gateway/gateway.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from './redis/redis.module';
import { KoreanStockCode } from './stock-data/entities/KoreanStockCode.entity';
import { WeekStockData } from './stock-data/entities/WeekStockData.entity';



const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    charset: configService.get("CHAR_SET"), //이모지를 위한 추가 설정기능 이유 : 이모지는 3byte인데 utf8mb는 최대 2바이트밖에 받지 못하기 때문이다.
    entities: [DayStockData, TrCode, PeakDate, PeakPrice, FilteredPeak, UserInflection, KoreanStockCode,WeekStockData],
    synchronize: configService.get('DB_SYNC'),
    logging: true,
    timezone: '+09:00'
  }),
  inject: [ConfigService],
};


@Module({
  imports: [ ClientsModule.register([
    {
      name: 'REDIS_CLIENT',
      transport: Transport.REDIS,
      options: { host: "redis" , port: 6379 },
    },
  ]),ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: Joi.object({
      DB_USERNAME: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),
      DB_HOST: Joi.string().required(),
      DB_PORT: Joi.number().required(),
      DB_NAME: Joi.string().required(),
      CHAR_SET: Joi.string().required(),
      DB_SYNC: Joi.boolean().required(),
    }),
  }), 
  SessionModule.forRoot({
    session: {
      secret: 'mySecretKey',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24시간 유지
    },
  }),
  StockDataModule, TypeOrmModule.forRootAsync(typeOrmModuleOptions), SchedularModule, LiveIndexModule, GatewayModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
