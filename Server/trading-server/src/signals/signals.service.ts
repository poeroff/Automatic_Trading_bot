import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { read } from 'fs';
import { Repository } from 'typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Alert } from 'src/stock-data/entities/Alert.entity';
import { EventsGateway } from 'src/gateway/events.gateway';
import { Get } from 'utils/axios_get';


@Injectable()
export class SignalsService {
  constructor(@InjectRepository(Alert) private AlertRepository : Repository<Alert>, @InjectRepository(KoreanStockCode) private KoreanStockCodeRepository : Repository<KoreanStockCode>,private readonly EventsGateway: EventsGateway){}

  async signalscreate(code: string, price : number) {
    const stockCode = await this.KoreanStockCodeRepository.findOne({ where: { code } });
  
    if (!stockCode) {
      throw new NotFoundException(`Stock with code ${code} not found`);
    }
    
    // Create the alert with the proper relation
    const alert = this.AlertRepository.create({
      price: +price,
      trCode: stockCode  // Set the entire entity, not just {code: code}
    });
    this.EventsGateway.signals()
    return await this.AlertRepository.save(alert);
  }

  async triggerStockSignal(url,headers) {
    let Trigger: Alert[] = []; // 명시적 타입 선언
    Trigger = await this.AlertRepository.find({
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
