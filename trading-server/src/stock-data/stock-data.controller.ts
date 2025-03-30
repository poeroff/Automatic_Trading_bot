import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { StockDataService } from './stock-data.service';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';

@Controller('stock-data')
export class StockDataController {
  constructor(private readonly stockDataService: StockDataService) {}
  // 키움 api로 통신하는 api
  @Get("TrueCode")
  GetTrueCode(){
    return this.stockDataService.GetTrueCode();
  }

  @Post("StockData")
  StockData(@Body() body: { code: string }) {
    return this.stockDataService.StockData(body.code);
  }



  @Get("get_all_codes")
  getAllCodes() {
    return this.stockDataService.getAllCodes();
  }
/*  */
  // @Get("get_true_codes")
  // gettrueCodes() {
  //   return this.stockDataService.gettrueCodes();
  // }


 


  @Get("get_user_inflection")
  getUserInflection(@Body() body: { code: string }) {
    return this.stockDataService.getUserInflection(body.code);
  }

  //사용자 변곡점 설정 추가 함수
  @Post("user-inflection")
  createUserInflection(
    @Body() body: { date: number; highPoint: number ; code?: string; name?: string }) {
    console.log("HELLO")
    if (body.code) {
      return this.stockDataService.createUserInflectioncode(body.date, body.code, body.highPoint); 
    } else if (body.name) {
      return this.stockDataService.createUserInflectionname(body.date, body.name, body.highPoint);
    }
  }
  
  @Delete("user-inflection")
  deleteUserInflection( @Body() body: { id: number }) {
    return this.stockDataService.deleteUserInflection(body.id);
  }


  //주식,고점,변곡점,변곡점 설정 데이터 가져오기
  @Get("stock")
  getstockPoint(@Query('code') code?: string, @Query('name') name?: string) {
    if (code) {
      return this.stockDataService.getstockPoint(+code); // tr_code로 조회
    } else if (name) {
      return this.stockDataService.getstockPoint(name); // stock_name으로 조회
    }
    return { message: 'No stock code or name provided' };
  }

  // //인증 여부 업데이트트
  // @Get("certified")
  // updateCertified(@Query('code') code?: string, @Query('name') name?: string) {
  //   if (code) {
  //     return this.stockDataService.updateCertifiedTrCode(code); // tr_code로 조회
  //   } else if (name) {
  //     return this.stockDataService.updateCertifiedStockName(name); // stock_name으로 조회
  //   }
  // }

  //인증이 안된 종목 조회
  @Get("FalseCertified")
  GetFalseCertified() {
    return this.stockDataService.getFalseCertified();
  }
  @Post("ReturnHighPeak")
  ReturnHighPeak(@Body() body :{ code : number}){
    return this.stockDataService.ReturnHighPeak(body.code)
  }

  @Post("ReturnInflectionPoint")
  ReturnInflectionPoint(@Body() body :{ code : number}){
    return this.stockDataService.ReturnInflectionPoint(body.code)
  }





}
