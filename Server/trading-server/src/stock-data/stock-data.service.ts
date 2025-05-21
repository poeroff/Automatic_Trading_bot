import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DayStockData } from './entities/DayStockData.entity';

import { PeakDate } from './entities/PeakDate.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/FilterPeak.entity';
import { UserInflection } from './entities/UserInflection.entity';
import { KoreanStockCode } from './entities/KoreanStockCode.entity';
import { number } from 'joi';


@Injectable()
export class StockDataService {
  constructor(
    @InjectRepository(DayStockData) private DayStockDataRepository: Repository<DayStockData>,
    @InjectRepository(KoreanStockCode) private KoreanStockCodeRepository: Repository<KoreanStockCode>,
    @InjectRepository(PeakDate) private peakDateRepository: Repository<PeakDate>,
    @InjectRepository(PeakPrice) private peakPriceRepository: Repository<PeakPrice>,
    @InjectRepository(FilteredPeak) private filteredPeakRepository: Repository<FilteredPeak>,
    @InjectRepository(UserInflection) private userInflectionRepository: Repository<UserInflection>,
  ) { }

  async trueCode(){
    try {
      const codes = await this.KoreanStockCodeRepository.find({where: { certified: true }, relations:["userInflections"]});     
      const filtered = codes.filter(code => code.userInflections.length > 0);
      return filtered
    } catch (error) {
      console.error('Error fetching codes:', error);
      throw new InternalServerErrorException('Failed to fetch codes');
    }
  }

  // async getAllCodes() {
  //   return await this.KoreanStockCodeRepository.find();
  // }

  // async gettrueCodes() {
  //   const trCodes = await this.koreanstockcodeRepository.find({ where: { certified: true }, relations: ["userInflections"] });
  //   const results = trCodes.filter(trCode => trCode.userInflections.length > 0);
  //   return results;
  // }







  // async getUserInflection(code: string) {
  //   const trCode = await this.KoreanStockCodeRepository.findOne({ where: { code: +code } });
  //   if (!trCode) {
  //     return { message: 'No stock code or name provided' };
  //   }
  //   return await this.userInflectionRepository.find({ where: { trCode: { certified: true, id: trCode.id } } });
  // }

  //사용자 변곡점 설정 추가 함수(tr_code로 조회)
  async createUserInflectioncode(date: number, code: string, highPoint?: number | null) {
    const trCode = await this.KoreanStockCodeRepository.findOne({ where: { code: code } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    const dateString = date.toString();
    const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    const queryDate = new Date(formattedDate);

    // 시간을 00:00:00으로 고정
    queryDate.setHours(0, 0, 0, 0);
    const reference_date = await this.DayStockDataRepository.findOne({where: {trCode: { id: trCode.id } , date: date.toString() }});
   
    if(reference_date){
      const userInflection = this.userInflectionRepository.create({ trCode: { id: trCode.id }, date: date, highdate : highPoint ?? null , price : reference_date?.high});
      return await this.userInflectionRepository.save(userInflection);
    }
    throw new NotFoundException('Reference date not found');
   
  
  }
  //사용자 변곡점 설정 추가 함수(stock_name으로 조회)
  async createUserInflectionname(date: number, name: string, highPoint?: number | null) {
    const trCode = await this.KoreanStockCodeRepository.findOne({ where: { company: name } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    const userInflection = this.userInflectionRepository.create({ trCode: { id: trCode.id }, date: date, highdate: highPoint ?? null });
    return await this.userInflectionRepository.save(userInflection);
  }

  //사용자 변곡점 설정 삭제 함수
  async deleteUserInflection(id: number) {
    return await this.userInflectionRepository.delete(id);
  }




  //주식,고점,변곡점,변곡점 설정 데이터 가져오기(tr_code로 조회)
  async stockPoint(stock: string) {
    const Company = await this.KoreanStockCodeRepository.findOne({ where: { code: String(stock) } });
    if (!Company) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const StockData = await this.DayStockDataRepository.find({ 
      where: { trCode: { id: Company.id } },
      order: { date: "ASC" }
    });
    const PeakDates = await this.peakDateRepository.find({ where: { trCode: { id: Company.id } } });
    const FilteredPeaks = await this.filteredPeakRepository.find({ where: { trCode: { id: Company.id } } });
    const UserInflections = await this.userInflectionRepository.find({ where: { trCode: { id: Company.id } } });
    return { Company, StockData, PeakDates, FilteredPeaks, UserInflections };

  }



  //인증 여부 업데이트 함수(tr_code로 조회)
  async updateCertifiedTrCode(code: string) {
    const trCode = await this.KoreanStockCodeRepository.findOne({ where: { code: code } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    trCode.certified = true;
    return await this.KoreanStockCodeRepository.save(trCode);
  }

  // //인증 여부 업데이트 함수(stock_name으로 조회)
  // async updateCertifiedStockName(name: string) {
  //   const trCode = await this.koreanstockcodeRepository.findOne({ where: { name: name } });
  //   if (!trCode) {
  //     return { message: 'No stock code or name provided' };
  //   }
  //   trCode.certified = true;
  //   return await this.koreanstockcodeRepository.save(trCode);
  // }

  async falseCertified() {
    //relations 쓰는 이유 그 자식 관계 맺어진 데이터까지 가져오기 위해서

    
    // const uncertifiedTrCodes = await this.KoreanStockCodeRepository.find({ where: { certified: false }, relations: ['peakDates', 'filteredPeaks'] });
    const uncertifiedTrCodes = await this.KoreanStockCodeRepository.find({ where: { capital_Impairment: 'N', admn_item_yn: 'N',tr_stop_yn : 'N', mcap: 'N', sale_account: 'N',certified: false , unmet_conditions : true},take : 10 });

    return uncertifiedTrCodes;
  }

  async returnHighPeak(code : string){
    const Company = await this.KoreanStockCodeRepository.findOne({where : {code : code}})
    return await this.peakDateRepository.find({where : {trCode : {id : Company!.id}}})
  }

  async returnInflectionPoint(code : string){
    const Company = await this.KoreanStockCodeRepository.findOne({where : {code : code}})
    return await this.userInflectionRepository.find({where : {trCode : {id : Company!.id}}})
  }

  
  async StockData(code: string) {
    const rawData = await this.DayStockDataRepository.find({
        where: { trCode: { code: code } },
        order: { date: 'ASC' }
    });
    //relations을 안썻는데도 부모 요소가 불러와져서 트래픽 폭증으로 데이터가 중간에 끊켜서 특정 행만 추출하기 위해서
    const processedData = rawData.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        // is_high_point: item.is_high_point
    }));
    
    return { Data: processedData };
  } 

 
}
