// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { ClientsModule, Transport } from '@nestjs/microservices';
// import { UpdateModule } from './update/update.module';

// @Module({
//   imports: [
//     ClientsModule.register([
//       {
//         name: 'WORKER_SERVICE',
//         transport: Transport.REDIS,
//         options: {
//           host: 'redis',
//           port: 6379,
//         },
//       },
//     ]),
//     UpdateModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DayStockData } from '../libs/entity/DayStockData.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as Joi from 'joi';
import { SessionModule } from 'nestjs-session';

import { PeakPrice } from '../libs/entity/PeakPrice.entity';
import { FilteredPeak } from '../libs/entity/FilterPeak.entity';
import { PeakDate } from '../libs/entity/PeakDate.entity';
import { UserInflection } from '../libs/entity/UserInflection.entity';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { KoreanStockCode } from '../libs/entity/KoreanStockCode.entity';
import { Alert } from '../libs/entity/Alert.entity'
import { UpdateModule } from './update/update.module';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StockFilter } from '../libs/entity/StockFilter';



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
    entities: [DayStockData, PeakDate, PeakPrice, FilteredPeak, UserInflection, KoreanStockCode, Alert, StockFilter],
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
             options: {
               host: 'redis',
               port: 6379,
             },
           },
    ]), 
    ConfigModule.forRoot({
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
   TypeOrmModule.forRootAsync(typeOrmModuleOptions),UpdateModule, RedisModule,ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

