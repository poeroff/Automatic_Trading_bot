import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { SchedularService } from './schedular.service';
import { CreateSchedularDto } from './dto/create-schedular.dto';
import { UpdateSchedularDto } from './dto/update-schedular.dto';
import { Cron } from '@nestjs/schedule';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './SessionService';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';



@Controller('schedular')
export class SchedularController {
  constructor(private readonly schedularService: SchedularService, private configService : ConfigService, private readonly sessionService: SessionService, @Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy) {}
  private readonly appkey = this.configService.get<string>('appkey')
  private readonly appsecret = this.configService.get<string>('appsecret')
  
  

  //Hashkey 발급
  @Cron('0 17 21 * * *')
  //@Cron('0 0 * * * *')
  CreateAuthHashKey(){
    const url = 'https://openapi.koreainvestment.com:9443/uapi/hashkey';
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'appkey': this.appkey,
      'appsecret': this.appsecret, // 여기에 실제 값을 넣으세요
    };
    const data = {
      ORD_PRCS_DVSN_CD: '02',
      CANO: '64858706', // 계좌번호 입력
      ACNT_PRDT_CD: '03',
      SLL_BUY_DVSN_CD: '02',
      SHTN_PDNO: '101S06',
      ORD_QTY: '1',
      UNIT_PRICE: '370',
      NMPR_TYPE_CD: '',
      KRX_NMPR_CNDT_CD: '',
      CTAC_TLNO: '',
      FUOP_ITEM_DVSN_CD: '',
      ORD_DVSN_CD: '02',
    };
    this.schedularService.CreateAuthHashKey(url,headers,data);
  }

  //AccessToken 발급
  @Cron('0 25 11 * * *',{timeZone :'Asia/Seoul'})
  //@Cron('0 0 * * * *')
  CreateAccessToken(){
    const url = "https://openapi.koreainvestment.com:9443/oauth2/tokenP"
    const headers = {
           "Content-Type": "application/json; charset=UTF-8"
    }
    const data = {
           "grant_type": "client_credentials",
           "appkey": this.appkey,  
           "appsecret": this.appsecret 
    }
    this.schedularService.CreateAccessToken(url,headers,data);
  }

  //웹 소켓 토큰 발급
  @Cron('0 55 12 * * *')
  CreateWebSocketToken(){
    const url = "https://openapi.koreainvestment.com:9443/oauth2/Approval"
    const headers = {
           "Content-Type": "application/json; charset=UTF-8"
    }
    const data = {
           "grant_type": "client_credentials",
           "appkey": this.appkey,  
           "secretkey": this.appsecret 
    }
    this.schedularService.CreateWebSocketToken(url,headers,data);
  }

  //주식 일봉 데이터 수집집
  @Cron('30 25 11 * * *',{timeZone :'Asia/Seoul'})
  async getDayStockData(){
    const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': savedToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHKST03010100', // 주식 차트 데이터 요청 ID
      "custtype" :"P",
      "tr_cont" : "M"

      
    };
 
    this.schedularService.getDayStockData(url,headers)
  }

  //주식 주봉 데이터 수집집
  @Cron('0 42 14 * * *',{timeZone :'Asia/Seoul'})
  async getWeekStockData(){
    const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': savedToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHKST03010100', // 주식 차트 데이터 요청 ID
      "custtype" :"P",
      "tr_cont" : "M"
    };
    this.schedularService.getWeekStockData(url,headers)
  }

  

  //주식 정보 업데이트
  @Cron('0 30 20 * * *',{timeZone :'Asia/Seoul'})
  async StockData(){
    const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const url = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/industry-price";
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': savedToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'HHDFS76370100', // 주식 차트 데이터 요청 ID
      "custtype" :"P"
    };
    console.log(headers)
 
    const params = {
      AUTH: '', // 주식
      EXCD: "NYS", // 종목 코드 (예: 005930 - 삼성전자)
    };
    this.schedularService.StockData(url,headers,params)
  }




  @Get()
  findAll() {
    return this.schedularService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedularService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchedularDto: UpdateSchedularDto) {
    return this.schedularService.update(+id, updateSchedularDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedularService.remove(+id);
  }
}
