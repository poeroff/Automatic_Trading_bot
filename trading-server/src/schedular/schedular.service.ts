import { Inject, Injectable } from '@nestjs/common';
import { CreateSchedularDto } from './dto/create-schedular.dto';
import { UpdateSchedularDto } from './dto/update-schedular.dto';
import axios from 'axios';
import dayjs from 'dayjs';
import { SessionService } from './SessionService';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Repository } from 'typeorm';

import { sleep } from 'utils/sleep';
import { DayStockData } from 'src/stock-data/entities/DayStockData.entity';
import { WeekStockData } from 'src/stock-data/entities/WeekStockData.entity';


@Injectable()
export class SchedularService {
  constructor(@InjectRepository(KoreanStockCode) private readonly koreastockcodeRepository : Repository<KoreanStockCode> ,
              @InjectRepository(DayStockData) private readonly daystockdataRepository : Repository<DayStockData>,
              @InjectRepository(WeekStockData) private readonly weekstockdataRepository : Repository<WeekStockData>,
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


  // -- 임시 테이블 생성 및 정렬된 데이터 삽입
  // CREATE TABLE DayStockData_temp AS
  // SELECT * FROM DayStockData
  // ORDER BY code_id ASC, date DESC;

  // -- 원본 테이블 삭제
  // DROP TABLE DayStockData;

  // -- 임시 테이블 이름 변경
  // RENAME TABLE DayStockData_temp TO DayStockData;
  async getDayStockData(url, headers) {
    const codeList = await this.koreastockcodeRepository.find();
    for (let i = 0; i < codeList.length; i++) {
      const code = codeList[i];
      const originalDate = code.listed_date;
    
      const codeStr = code.code.toString().padStart(6, '0');
      const startDay = dayjs(originalDate, 'YYYY-MM-DD'); 
      const endDay = dayjs(this.todayStr, 'YYYYMMDD').subtract(1, 'day');
      // 100일씩 끊을 범위 설정
      const chunkSize = 100;
      let currentStart = startDay;

      // while문으로 100일 단위 반복
      while (currentStart.isBefore(endDay)) {
        // currentStart + 99일 = 이번 chunk의 종료일
        let currentEnd = currentStart.add(chunkSize - 1, 'day');
        // 만약 endDay를 넘어가면 endDay로 조정
        if (currentEnd.isAfter(endDay)) {
          currentEnd = endDay;
        }

        // API 파라미터 (주봉)
        const params = {
          FID_COND_MRKT_DIV_CODE: 'J',        // 주식
          FID_INPUT_ISCD: codeStr,            // 종목 코드
          FID_INPUT_DATE_1: currentStart.format('YYYYMMDD'),  // chunk 시작
          FID_INPUT_DATE_2: currentEnd.format('YYYYMMDD'),    // chunk 종료
          FID_PERIOD_DIV_CODE: 'D',           // 주봉
          FID_ORG_ADJ_PRC: '0',               // 수정주가
        };

        // API 호출 전 잠시 대기
        await sleep(500);

        // API 호출
        try {
          const response = await axios.get(url, { headers, params });
          const data = response.data;
          const output2 = data.output2;
          //여기서 DB 저장 등 필요한 작업을 수행
          for (const stockdata of output2) {
            const stock = await this.daystockdataRepository.findOne({where : {date : stockdata.stck_bsop_date , trCode : {id :Number(code.id)  }}})
            if(!stock){
              await this.daystockdataRepository.save({ date: stockdata.stck_bsop_date, open: Number(stockdata.stck_oprc), high: Number(stockdata.stck_hgpr), low: Number(stockdata.stck_lwpr), close: Number(stockdata.stck_clpr), volume: Number(stockdata.acml_vol), trCode: { id: Number(code.id) } });
            }
          }
        } catch (error) {
          console.error('API 호출 에러:', error.message);
        }

        // 다음 chunk 시작일은 이번 chunk의 끝 + 1일
        currentStart = currentEnd.add(1, 'day');
        // 만약 currentStart가 endDay를 넘어가면 while문에서 탈출됨
      }

    }
}

  async getWeekStockData(url,headers){
    let count = 0;
    const codeList = await this.koreastockcodeRepository.find();
    for (let i = 500; i < codeList.length; i++) {
      const code = codeList[i];
      const originalDate = code.listed_date;
    
      const codeStr = code.code.toString().padStart(6, '0');
      const startDay = dayjs(originalDate, 'YYYY-MM-DD'); 
      const endDay = dayjs(this.todayStr, 'YYYYMMDD');
      // 100일씩 끊을 범위 설정
      const chunkSize = 100;
      let currentStart = startDay;

      // while문으로 100일 단위 반복
      while (currentStart.isBefore(endDay)) {
        // currentStart + 99일 = 이번 chunk의 종료일
        let currentEnd = currentStart.add(chunkSize - 1, 'day');
        // 만약 endDay를 넘어가면 endDay로 조정
        if (currentEnd.isAfter(endDay)) {
          currentEnd = endDay;
        }

        // API 파라미터 (주봉)
        const params = {
          FID_COND_MRKT_DIV_CODE: 'J',        // 주식
          FID_INPUT_ISCD: codeStr,            // 종목 코드
          FID_INPUT_DATE_1: currentStart.format('YYYYMMDD'),  // chunk 시작
          FID_INPUT_DATE_2: currentEnd.format('YYYYMMDD'),    // chunk 종료
          FID_PERIOD_DIV_CODE: 'W',           // 주봉
          FID_ORG_ADJ_PRC: '0',               // 수정주가
        };

        // API 호출 전 잠시 대기
        await sleep(500);

        // API 호출
        try {
          const response = await axios.get(url, { headers, params });
          const data = response.data;
          const output2 = data.output2;
          //여기서 DB 저장 등 필요한 작업을 수행
          for (const stockdata of output2) {
            const stock = await this.weekstockdataRepository.findOne({where : {date : stockdata.stck_bsop_date , trCode : {id :Number(code.id)  }}})
            if(!stock){
              await this.weekstockdataRepository.save({ date: stockdata.stck_bsop_date, open: Number(stockdata.stck_oprc), high: Number(stockdata.stck_hgpr), low: Number(stockdata.stck_lwpr), close: Number(stockdata.stck_clpr), volume: Number(stockdata.acml_vol), trCode: { id: Number(code.id) } });
            }
          }
        } catch (error) {
          console.error('API 호출 에러:', error.message);
        }

        // 다음 chunk 시작일은 이번 chunk의 끝 + 1일
        currentStart = currentEnd.add(1, 'day');
        // 만약 currentStart가 endDay를 넘어가면 while문에서 탈출됨
      }

      count++;
      if (count === 1) {
        break;
      }
    }
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
