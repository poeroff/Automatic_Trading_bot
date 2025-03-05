import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiveIndexService } from './live_index.service';
import { ConfigService } from '@nestjs/config';
import { SessionService } from 'src/schedular/SessionService';


@Controller("liveindex")
export class LiveIndexController {
    constructor(private readonly liveindexservice: LiveIndexService, private configService : ConfigService, private readonly sessionService: SessionService) {}
    private readonly appkey = this.configService.get<string>('appkey')
    private readonly appsecret = this.configService.get<string>('appsecret')

    @Get("kospi")
    Kospiindex(){
        const url = "https://openapi.koreainvestment.com:9443//uapi/domestic-stock/v1/quotations/inquire-index-price"
        const headers = {
          'Content-Type': 'application/json; charset=UTF-8',
          'authorization': this.sessionService.getAccessToken(),
          'appkey': this.appkey,
          'appsecret': this.appsecret,
          'tr_id': 'FHPUP02100000', // 주식 차트 데이터 요청 ID
          "custtype" :"P"
        };
        const params = {
          FID_COND_MRKT_DIV_CODE	: 'U',
          FID_INPUT_ISCD: "0001",
        };
      
    }

}
