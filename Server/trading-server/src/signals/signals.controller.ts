import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { get } from 'http';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService,private configService : ConfigService, @Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy) {}
  private readonly appkey = this.configService.get<string>('appkey')
  private readonly appsecret = this.configService.get<string>('appsecret')

  @Post()
  signalscreate(@Body() body : {code : string , price: number}) {
    return this.signalsService.signalscreate(body.code, body.price)
   
  }
  //일부분 알림 신호 보내주기
  @Get("/trigger")
  async triggerStockSignal(){
    const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price"
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': savedToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHKST01010100', // 주식 차트 데이터 요청 ID
      "custtype" :"P",
      "tr_cont" : "M"
    };
    console.log(headers)
    return this.signalsService.triggerStockSignal(url,headers)
  }
  //모든 알림 신호 보내주기
  @Post("triggers")
  triggerStockSignals(){
    return this.signalsService.triggerStockSignals()
  }



  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.signalsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSignalDto: UpdateSignalDto) {
    return this.signalsService.update(+id, updateSignalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.signalsService.remove(+id);
  }
}
