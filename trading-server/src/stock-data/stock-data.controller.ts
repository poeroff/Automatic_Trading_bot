import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { StockDataService } from './stock-data.service';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';

@Controller('stock-data')
export class StockDataController {
  constructor(private readonly stockDataService: StockDataService) {}

  @Post()
  create(@Body() createStockDatumDto: CreateStockDatumDto) {
    return this.stockDataService.create(createStockDatumDto);
  }

  @Get("get_all_codes")
  getAllCodes() {
    return this.stockDataService.getAllCodes();
  }
/*  */
  @Get("get_true_codes")
  gettrueCodes() {
    return this.stockDataService.gettrueCodes();
  }


  @Post("get_stock_data")
  getStockData(@Body() body: { code: string }) {
    return this.stockDataService.getStockData(body.code);
  }




  @Get("get_user_inflection")
  getUserInflection(@Body() body: { code: string }) {
    return this.stockDataService.getUserInflection(body.code);
  }
  //사용자 변곡점 설정 추가 함수
  @Post("user-inflection")
  createUserInflection(
    @Body() body: { date: number; highPoint?: number | null; code?: string; name?: string }) {
    console.log("요청 데이터:", body);
  
    if (!body.code && !body.name) {
      throw new BadRequestException("code 또는 name 값이 필요합니다.");
    }
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
  findOne(@Query('code') code?: string, @Query('name') name?: string) {
    if (code) {
      return this.stockDataService.findOneByTrCode(code); // tr_code로 조회
    } else if (name) {
      return this.stockDataService.findOneByStockName(name); // stock_name으로 조회
    }
    return { message: 'No stock code or name provided' };
  }

  //인증 여부 업데이트트
  @Get("certified")
  updateCertified(@Query('code') code?: string, @Query('name') name?: string) {
    if (code) {
      return this.stockDataService.updateCertifiedTrCode(code); // tr_code로 조회
    } else if (name) {
      return this.stockDataService.updateCertifiedStockName(name); // stock_name으로 조회
    }
  }

  //인증이 안된 종목 조회
  @Get("false-certified")
  getFalseCertified() {
    return this.stockDataService.getFalseCertified();
  }



  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDatumDto: UpdateStockDatumDto) {
    return this.stockDataService.update(+id, updateStockDatumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockDataService.remove(+id);
  }
}
