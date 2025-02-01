import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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

  @Get()
  findAll() {
    return this.stockDataService.findAll();
  }

  @Get("stock")
  findOne(@Query('code') code?: string, @Query('name') name?: string) {
    if (code) {
      console.log(code)
      return this.stockDataService.findOneByTrCode(code); // tr_code로 조회
    } else if (name) {
      return this.stockDataService.findOneByStockName(name); // stock_name으로 조회
    }

    return { message: 'No stock code or name provided' };
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
