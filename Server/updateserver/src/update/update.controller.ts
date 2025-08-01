import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { UpdateService } from './update.service';
import { CreateUpdateDto } from './dto/create-update.dto';
import { UpdateUpdateDto } from './dto/update-update.dto';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';

@Controller('update')
export class UpdateController {
  constructor(private readonly updateService: UpdateService, private configService : ConfigService,@Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy) {}

  private readonly appkey = this.configService.get<string>('appkey')
  private readonly appsecret = this.configService.get<string>('appsecret')
  

  //Hashkey 발급
  // @Cron('0 17 21 * * *')
  @Cron('1 0 0 * * 1,5',{timeZone :'Asia/Seoul'})
  createAuthHashKey(){
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
    this.updateService.createAuthHashKey(url,headers,data);
  }

  //AccessToken 발급
  @Cron('0 24 14 * * *',{timeZone :'Asia/Seoul'})
  //@Cron('0 0 * * * *')
  createAccessToken(){
    const url = "https://openapi.koreainvestment.com:9443/oauth2/tokenP"
    const headers = {
           "Content-Type": "application/json; charset=UTF-8"
    }
    const data = {
           "grant_type": "client_credentials" ,
           "appkey": this.appkey,  
           "appsecret": this.appsecret 
    }
    this.updateService.createAccessToken(url,headers,data);
  }

  //웹 소켓 토큰 발급
  @Cron('1 0 0 * * 1,5',{timeZone :'Asia/Seoul'})
  createWebSocketToken(){
    const url = "https://openapi.koreainvestment.com:9443/oauth2/Approval"
    const headers = {
           "Content-Type": "application/json; charset=UTF-8"
    }
    const data = {
           "grant_type": "client_credentials",
           "appkey": this.appkey,  
           "secretkey": this.appsecret 
    }
    this.updateService.createWebSocketToken(url,headers,data);
  }

  // //주식 일봉 데이터 수집(상장 ~ 어제) 주식 데이터가 완전히 비어있을떄 딱 한번 그 외에는 사용하지 말것
  // @Cron('5 27 17 * * *',{timeZone :'Asia/Seoul'})
  // async alldayStockData(){
  //   const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
  //   const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
  //   const headers = {
  //     'Content-Type': 'application/json; charset=UTF-8',
  //     'authorization': savedToken,
  //     'appkey': this.appkey,
  //     'appsecret': this.appsecret,
  //     'tr_id': 'FHKST03010100', // 주식 차트 데이터 요청 ID
  //     "custtype" :"P",
  //     "tr_cont" : "M"
  //   };
 
  //   this.updateService.alldayStockData(url,headers)
  // }
  //   //주식 일봉 데이터 수집(현재)
  //   //@Cron('0 43 19 * * *',{timeZone :'Asia/Seoul'})
  //   async dayStockData(){
  //     const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
  //     const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
  //     const headers = {
  //       'Content-Type': 'application/json; charset=UTF-8',
  //       'authorization': savedToken,
  //       'appkey': this.appkey,
  //       'appsecret': this.appsecret,
  //       'tr_id': 'FHKST03010100', // 주식 차트 데이터 요청 ID
  //       "custtype" :"P",
  //       "tr_cont" : "M"
  //     };
  //     this.updateService.dayStockData(url,headers)
  //   }

  // //주식 주봉 데이터 수집
  // //@Cron('0 42 11 * * *',{timeZone :'Asia/Seoul'})
  // async allweekStockData(){
  //   const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
  //   const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
  //   const headers = {
  //     'Content-Type': 'application/json; charset=UTF-8',
  //     'authorization': savedToken,
  //     'appkey': this.appkey,
  //     'appsecret': this.appsecret,
  //     'tr_id': 'FHKST03010100', // 주식 차트 데이터 요청 ID
  //     "custtype" :"P",
  //     "tr_cont" : "M"
  //   };
  //   this.updateService.allweekStockData(url,headers)
  // }

  

  // //주식 정보 업데이트
  // //@Cron('0 30 20 * * *',{timeZone :'Asia/Seoul'})
  // async stockData(){
  //   const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
  //   const url = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/industry-price";
  //   const headers = {
  //     'Content-Type': 'application/json; charset=UTF-8',
  //     'authorization': savedToken,
  //     'appkey': this.appkey,
  //     'appsecret': this.appsecret,
  //     'tr_id': 'HHDFS76370100', // 주식 차트 데이터 요청 ID
  //     "custtype" :"P"
  //   };
 
  //   const params = {
  //     AUTH: '', // 주식
  //     EXCD: "NYS", // 종목 코드 (예: 005930 - 삼성전자)
  //   };
  //   this.updateService.stockData(url,headers,params)
  // }
}
