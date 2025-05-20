import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { StockRankingsService } from './stock-rankings.service';
import { CreateStockRankingDto } from './dto/create-stock-ranking.dto';
import { UpdateStockRankingDto } from './dto/update-stock-ranking.dto';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

@Controller('stock-rankings')
export class StockRankingsController {
  constructor(private readonly stockRankingsService: StockRankingsService, private configService : ConfigService,@Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy ) {}
  private readonly appkey = this.configService.get<string>('appkey')
  private readonly appsecret = this.configService.get<string>('appsecret')

  //거래량 순위
  @Get("/tradingvolume")
  async tradingvolume() {
    const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/volume-rank";
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': savedToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHPST01710000', 
      "custtype" :"P",
      
    };
    console.log(headers)
    const params = {
      FID_COND_MRKT_DIV_CODE: 'J',        
      FID_COND_SCR_DIV_CODE: "20171",          
      FID_INPUT_ISCD: "0000",  
      FID_DIV_CLS_CODE: "0",    
      FID_BLNG_CLS_CODE : "0",
      FID_TRGT_CLS_CODE: '111111111',          
      FID_TRGT_EXLS_CLS_CODE: '0000000000',    
      FID_INPUT_PRICE_1 : "",
      FID_INPUT_PRICE_2 : "",
      FID_VOL_CNT : "",
      FID_INPUT_DATE_1 :"",
    };
    return this.stockRankingsService.tradingvolume(url,headers,params);
  }

  @Get()
  findAll() {
    return this.stockRankingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockRankingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockRankingDto: UpdateStockRankingDto) {
    return this.stockRankingsService.update(+id, updateStockRankingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockRankingsService.remove(+id);
  }
}
