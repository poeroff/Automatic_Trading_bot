import { Inject, Injectable } from '@nestjs/common';
import { CreateSchedularDto } from './dto/create-schedular.dto';
import { UpdateSchedularDto } from './dto/update-schedular.dto';
import axios from 'axios';
import { SessionService } from './SessionService';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Kospi } from 'src/stock-data/entities/Kospi.entity';
import { Repository } from 'typeorm';

import { sleep } from 'utils/sleep';
import { StockData } from 'src/stock-data/entities/stock-data.entity';


@Injectable()
export class SchedularService {
  constructor(@InjectRepository(Kospi) private readonly KospiRepository : Repository<Kospi> ,
              @InjectRepository(StockData) private readonly stockdataRepository : Repository<StockData>,
              private readonly sessionService: SessionService, 
              @Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy) {} // ✅ 세션 서비스 주입

  today = new Date();
  year = this.today.getFullYear().toString();
  month = (this.today.getMonth() + 1).toString().padStart(2, '0');
  day = this.today.getDate().toString().padStart(2, '0');

  // YYYYMMDD 형태로 조합
  todayStr = `${this.year}${this.month}${this.day}`;

  async CreateAuthHashKey(url, headers, data){
    try {
      const response = await axios.post(url, data, { headers: headers });
      this.sessionService.setHashKey(response.data.HASH); //Hashkey 설정
    } catch (error) {
      throw new Error('API request failed');
    }

  }
  
  async CreateAccessToken(url, headers, data) {
    try {
      const response = await axios.post(url, data, { headers: headers });
  
      const accessToken = response.data.token_type + " " + response.data.access_token;
 
  
      // Redis에 저장 (이벤트 발생)
      this.redisClient.emit('set_key', { key: "AccessToken", value: accessToken, ttl : 86400 });
  
  
      // 1초 후 Redis에서 값 가져와서 확인
      setTimeout(async () => {
        const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        console.log(`✅ Retrieved from Redis: ${savedToken}`);
      }, 1000);
  
      this.sessionService.setAccessToken(accessToken);
    } catch (error) {
      console.error('❌ API request failed:', error.message);
      throw new Error('API request failed');
    }
  }
  
  


  async CreateWebSocketToken(url, headers, data){
    try {
      const response = await axios.post(url, data, { headers: headers });
      this.sessionService.setWebSocketToken(response.data.approval_key)
    } catch (error) {
      throw new Error('API request failed');
    }
  }

  async getWeeklyStockData(url,headers){

    let count = 0;
    const codeList = await this.KospiRepository.find();
    for (const code of codeList) {
      console.log(code.id)
      const originalDate = code.listed_date; 
      const formattedDate = originalDate.replace(/-/g, ''); 
      const codeStr = code.code.toString().padStart(6, '0');
      const params = {
        FID_COND_MRKT_DIV_CODE: 'J', // 주식
        FID_INPUT_ISCD: codeStr, // 종목 코드 (예: 005930 - 삼성전자)
        FID_INPUT_DATE_1 : formattedDate,
        FID_INPUT_DATE_2 : this.todayStr,
        FID_PERIOD_DIV_CODE: 'D', // 주봉 (Weekly)
        FID_ORG_ADJ_PRC: '0', // 수정주가 미적용
      };
      await sleep(500)
      const response = await axios.get(url, { headers : headers, params : params });
      const data = response.data;
      const output2 = data.output2;
      for(const stockdata of output2){
        await this.stockdataRepository.save({date : stockdata.stck_bsop_date, open :Number(stockdata.stck_oprc),  high:Number(stockdata.stck_hgpr), low:Number(stockdata.stck_lwpr), close : Number(stockdata.stck_clpr),volume:Number(stockdata.acml_vol), trCode : {id : Number(code.id)}})
      }
      
      count++;
      if (count === 3) {
        break;
      }
    
      
      // 필요한 다른 작업 수행
    }
    

   
    
    // try {
    //   const response = await axios.get(url, { headers : headers, params : params });
     
    //   console.log(response.data.output2)
    
    //   return response.data;
    // } catch (error) {
    //   throw new Error('주봉 데이터 조회 실패');
    // }

  }

  async StockData(url,headers,data){
    
    try {
      const response = await axios.post(url, data, { headers : headers });
     
      console.log(response.data.output)
    
      return response.data;
    } catch (error) {
      throw new Error('주봉 데이터 조회 실패');
    }

  }


  findAll() {
    return `This action returns all schedular`;
  }

  findOne(id: number) {
    return `This action returns a #${id} schedular`;
  }

  update(id: number, updateSchedularDto: UpdateSchedularDto) {
    return `This action updates a #${id} schedular`;
  }

  remove(id: number) {
    return `This action removes a #${id} schedular`;
  }
}
