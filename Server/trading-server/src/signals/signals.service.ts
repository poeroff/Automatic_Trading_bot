import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { read } from 'fs';
import { MoreThan, Repository } from 'typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Alert } from 'src/stock-data/entities/Alert.entity';
import { EventsGateway } from 'src/gateway/events.gateway';
import { Get } from 'utils/axios_get';
import dayjs from 'dayjs';


@Injectable()
export class SignalsService {
  constructor(@InjectRepository(Alert) private AlertRepository : Repository<Alert>, @InjectRepository(KoreanStockCode) private KoreanStockCodeRepository : Repository<KoreanStockCode>,private readonly EventsGateway: EventsGateway){}

  async signalscreate(code: string, price : number) {
    const stockCode = await this.KoreanStockCodeRepository.findOne({ where: { code } });
  
    if (!stockCode) {
      throw new NotFoundException(`Stock with code ${code} not found`);
    }
     // 1. 한달 전 날짜 계산
     const oneMonthAgo = dayjs().subtract(31, 'day').toDate();

     // 2. 해당 stock_id를 가지면서, 일주일 내에 생성된 Alert가 있는지 확인
     const recentAlert = await this.AlertRepository.findOne({
       where: {
         trCode: { id: stockCode.id }, // 관계를 통해 stock_id 필터링
         createdAt: MoreThan(oneMonthAgo), // createdAt이 일주일 전보다 최신인지 확인
       },
       order: { createdAt: 'DESC' }, // 혹시 여러 개 있을 경우 최신 것을 기준으로 확인 (선택적)
     });
    if (recentAlert) {
      throw new ConflictException(
        `An alert for code ${code} was already created on ${dayjs(recentAlert.createdAt).format('YYYY-MM-DD HH:mm')}, which is within the last 7 days.`,
      );
      // 또는 return recentAlert; 등으로 기존 알림을 반환할 수도 있습니다.
    }
    // 4. 일주일 내에 생성된 Alert가 없다면, 새로 생성
    const alert = this.AlertRepository.create({
      price: +price,
      trCode: stockCode, // 전체 엔티티 할당
      has_item: true,
      // createdAt은 @BeforeInsert 데코레이터에 의해 자동으로 설정됩니다.
    });
  
    // this.EventsGateway.signals()
    return await this.AlertRepository.save(alert);
  }

  async triggerStockSignal(url,headers) {
    let Trigger: Alert[] = []; // 명시적 타입 선언
    Trigger = await this.AlertRepository.find({
      where : { has_item : true},
      order: {
        createdAt: 'DESC',
      },
      take: 6,
      relations: ["trCode"] // 가져올 데이터 개수 제한
    });

    for(let i = 0; i<Trigger.length; i++){
      const params = {
        FID_COND_MRKT_DIV_CODE: 'UN',        // 주식
        FID_INPUT_ISCD: Trigger[i].trCode.code,            // 종목 코드             // 수정주가
      };
      const response = await Get(url,headers,params)
      
      const output = response.data.output.stck_prpr;
      Trigger[i]['currentPrice'] = output; // Trigger[i] 객체에 'currentPrice' 속성 추가
    }

    return Trigger
    
 
    
  }
  triggerStockSignals(){
    return this.AlertRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} signal`;
  }

  update(id: number, updateSignalDto: UpdateSignalDto) {
    return `This action updates a #${id} signal`;
  }

  remove(id: number) {
    return `This action removes a #${id} signal`;
  }
}
