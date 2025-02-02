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
import { UserInflection } from './entities/user-inflection.entity';


@Injectable()
export class StockDataService {
  constructor(@InjectRepository(StockData)private stockDataRepository: Repository<StockData>, @InjectRepository(TrCode)private trCodeRepository: Repository<TrCode>, @InjectRepository(PeakDate)private peakDateRepository: Repository<PeakDate>, @InjectRepository(PeakPrice)private peakPriceRepository: Repository<PeakPrice>, @InjectRepository(FilteredPeak)private filteredPeakRepository: Repository<FilteredPeak>,@InjectRepository(UserInflection)private userInflectionRepository: Repository<UserInflection>,
  ) {}
  create(createStockDatumDto: CreateStockDatumDto) {
    return 'This action adds a new stockDatum';
  }




  findAll() {
    return `This action returns all stockData`;
  }

  async createUserInflectioncode(date: number, code: string) {
    console.log("date", date)
    console.log("code", code)

    const trCode = await this.trCodeRepository.findOne({ where: { code : code } });
    if(!trCode){
      return { message: 'No stock code or name provided' };
    }
    const userInflection =  this.userInflectionRepository.create({ trCode: { id: trCode.id }, date: date });
    return await this.userInflectionRepository.save(userInflection);

  


  }
  
  async createUserInflectionname(date: number,  name: string) {

    const trCode = await this.trCodeRepository.findOne({ where: { name : name } });
    if(!trCode){
      return { message: 'No stock code or name provided' };
    }
    const userInflection =  this.userInflectionRepository.create({ trCode: { id: trCode.id }, date: date });
    return await this.userInflectionRepository.save(userInflection);

  }

  async deleteUserInflection(id: number) {
    return await this.userInflectionRepository.delete(id);
  }





  async findOneByTrCode(trcode: string) {

    const trCode = await this.trCodeRepository.findOne({ where: { code : trcode } });
    if(!trCode){
      return { message: 'No stock code or name provided' };
    }
    const stockData = await this.stockDataRepository.find({ where: { trCode: { id: trCode.id } } });
    const peakDates = await this.peakDateRepository.find({ where: { trCode: { id: trCode.id } } });
    const filteredPeaks = await this.filteredPeakRepository.find({ where: { trCode: { id: trCode.id } } });
    const userInflections = await this.userInflectionRepository.find({ where: { trCode: { id: trCode.id } } });

    return { trCode, stockData, peakDates,  filteredPeaks, userInflections }; 

  }

  async findOneByStockName(stockName: string) {
    const trCode = await this.trCodeRepository.findOne({ where: { name : stockName } });
    if(!trCode){
      return { message: 'No stock code or name provided' };
    }
    const stockData = await this.stockDataRepository.find({ where: { trCode: { id: trCode.id } } });
    const peakDates = await this.peakDateRepository.find({ where: { trCode: { id: trCode.id } } });
    const filteredPeaks = await this.filteredPeakRepository.find({ where: { trCode: { id: trCode.id } } }); 
    const userInflections = await this.userInflectionRepository.find({ where: { trCode: { id: trCode.id } } });

    return { trCode, stockData, peakDates, filteredPeaks, userInflections }; 
  }

  update(id: number, updateStockDatumDto: UpdateStockDatumDto) {
    return `This action updates a #${id} stockDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockDatum`;
  }
}
