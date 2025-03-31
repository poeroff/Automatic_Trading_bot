import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { StockDataService } from './stock-data.service';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';

@Controller('stock-data')
export class StockDataController {
  constructor(private readonly stockDataService: StockDataService) {}
  // 키움 api로 통신하는 api
  @Get("TrueCode")
  trueCode(){
    return this.stockDataService.trueCode();
  }

  //인증이 안된 종목 조회
  @Get("FalseCertified")
  falseCertified() {
     return this.stockDataService.falseCertified();
  }

  // @Get("get_all_codes")
  // allCodes() {
  //   return this.stockDataService.getAllCodes();
  // }


/*  */
  // @Get("get_true_codes")
  // gettrueCodes() {
  //   return this.stockDataService.gettrueCodes();
  // }


  // @Get("get_user_inflection")
  // userInflection(@Body() body: { code: string }) {
  //   return this.stockDataService.getUserInflection(body.code);
  // }

  


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



  //주식,고점,변곡점,변곡점 설정 데이터 가져오기
  @Get("stock")
  stockPoint(@Query('code') code?: string, @Query('name') name?: string) {
    if (code) {
      return this.stockDataService.stockPoint(+code); // tr_code로 조회
    } else if (name) {
      return this.stockDataService.stockPoint(name); // stock_name으로 조회
    }
    return { message: 'No stock code or name provided' };
  }

  // //인증 여부 업데이트
  // @Get("certified")
  // updateCertified(@Query('code') code?: string, @Query('name') name?: string) {
  //   if (code) {
  //     return this.stockDataService.updateCertifiedTrCode(code); // tr_code로 조회
  //   } else if (name) {
  //     return this.stockDataService.updateCertifiedStockName(name); // stock_name으로 조회
  //   }
  // }

  //관리자가 설정한 변곡점 및 고점 삭제
  @Delete("user-inflection")
  deleteUserInflection( @Body() body: { id: number }) {
    return this.stockDataService.deleteUserInflection(body.id);
  }

  //---------------------------------------------------------------------------------------------------------------------------------------

  //FastApi에서 호출하는 api 고점 반환
  @Post("ReturnHighPeak")
  returnHighPeak(@Body() body :{ code : number}){
    return this.stockDataService.returnHighPeak(body.code)
  }
  //FastApi에서 호출하는 api 관리자가 입력한 변곡점 고점 반환환
  @Post("ReturnInflectionPoint")
  returnInflectionPoint(@Body() body :{ code : number}){
    return this.stockDataService.returnInflectionPoint(body.code)
  }
  //FastApi에서 호출하는 api 특정 주식 종목 일봉 가져오기기
  @Post("StockData")
  stockData(@Body() body: { code: string }) {
    return this.stockDataService.StockData(body.code);
  }





}
