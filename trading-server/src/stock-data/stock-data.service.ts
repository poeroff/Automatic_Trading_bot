import { Injectable } from '@nestjs/common';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockData } from './entities/stock-datum.entity';
import { TrCode } from './entities/tr-code.entity';
import { PeakDate } from './entities/peak-dates.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/filtered-peaks.entity';


@Injectable()
export class StockDataService {
  constructor(@InjectRepository(StockData)private stockDataRepository: Repository<StockData>, @InjectRepository(TrCode)private trCodeRepository: Repository<TrCode>, @InjectRepository(PeakDate)private peakDateRepository: Repository<PeakDate>, @InjectRepository(PeakPrice)private peakPriceRepository: Repository<PeakPrice>, @InjectRepository(FilteredPeak)private filteredPeakRepository: Repository<FilteredPeak>,
  ) {}
  create(createStockDatumDto: CreateStockDatumDto) {
    return 'This action adds a new stockDatum';
  }




  findAll() {
    return `This action returns all stockData`;
  }

  async findOneByTrCode(trcode: string) {
    console.log(trcode)
    const trCode = await this.trCodeRepository.findOne({ where: { code : trcode } });
    if(!trCode){
      return { message: 'No stock code or name provided' };
    }
    const stockData = await this.stockDataRepository.find({ where: { trCode: { id: trCode.id } } });
    const peakDates = await this.peakDateRepository.find({ where: { trCode: { id: trCode.id } } });
    const peakPrices = await this.peakPriceRepository.find({ where: { trCode: { id: trCode.id } } });
    const filteredPeaks = await this.filteredPeakRepository.find({ where: { trCode: { id: trCode.id } } }); 


    return { trCode, stockData, peakDates, peakPrices, filteredPeaks }; 


  }



  async findOneByStockName(stockName: string) {
    return `This action returns a #${stockName} stockDatum`;
  }

  update(id: number, updateStockDatumDto: UpdateStockDatumDto) {
    return `This action updates a #${id} stockDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockDatum`;
  }
}
