import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockData } from './entities/stock-data.entity';
import { TrCode } from './entities/tr-code.entity';
import { PeakDate } from './entities/peak-dates.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/filtered-peaks.entity';
import { UserInflection } from './entities/user-inflection.entity';


@Injectable()
export class StockDataService {
  constructor(
    @InjectRepository(StockData) private stockDataRepository: Repository<StockData>,
    @InjectRepository(TrCode) private trCodeRepository: Repository<TrCode>,
    @InjectRepository(PeakDate) private peakDateRepository: Repository<PeakDate>,
    @InjectRepository(PeakPrice) private peakPriceRepository: Repository<PeakPrice>,
    @InjectRepository(FilteredPeak) private filteredPeakRepository: Repository<FilteredPeak>,
    @InjectRepository(UserInflection) private userInflectionRepository: Repository<UserInflection>,
  ) { }
  create(createStockDatumDto: CreateStockDatumDto) {
    return 'This action adds a new stockDatum';
  }

  async getAllCodes() {
    return await this.trCodeRepository.find();
  }

  async gettrueCodes() {
    const trCodes = await this.trCodeRepository.find({ where: { certified: true }, relations: ["userInflections"] });
    const results = trCodes.filter(trCode => trCode.userInflections.length > 0);
    return results;
  }


  async getStockData(code: string) {
    console.log(code)
    const stockData = await this.stockDataRepository.find({
      where: { trCode: { code: code } },
      order: { date: 'ASC' }, // 날짜 순으로 정렬
    });

    if (!stockData || stockData.length === 0) {
      return { status: 'error', message: `Code ${code} not found in stock_data table` };
    }

    // 필요한 데이터만 추출
    const formattedData = stockData.map(data => ({
      Date: data.date,
      Open: data.open,
      High: data.high,
      Low: data.low,
      Close: data.close,
      Volume: data.volume,
     
    }));
    console.log(formattedData)


    return { data: formattedData };
  }



  async getUserInflection(code: string) {
    console.log(code)
    const trCode = await this.trCodeRepository.findOne({ where: { code: code } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    console.log(await this.userInflectionRepository.find({ where: { trCode: { certified: true, id: trCode.id } } }))
    return await this.userInflectionRepository.find({ where: { trCode: { certified: true, id: trCode.id } } });
  }

  //사용자 변곡점 설정 추가 함수(tr_code로 조회)
  async createUserInflectioncode(date: number, code: string, highPoint?: number | null) {
    const trCode = await this.trCodeRepository.findOne({ where: { code: code } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    const dateString = date.toString();
    const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    const queryDate = new Date(formattedDate);

    // 시간을 00:00:00으로 고정
    queryDate.setHours(0, 0, 0, 0);

    // const reference_date = await this.stockDataRepository.findOne({
    //   where: {
    //     trCode: { id: trCode.id },
    //     date: queryDate // 문자열로 비교
    //   }
    // });
    // if(reference_date){
    //   const userInflection = this.userInflectionRepository.create({ trCode: { id: trCode.id }, date: date, highdate : highPoint ?? null , price : reference_date?.high});
    //   return await this.userInflectionRepository.save(userInflection);
    // }
    // throw new NotFoundException('Reference date not found');
   
    


  
  }
  //사용자 변곡점 설정 추가 함수(stock_name으로 조회)
  async createUserInflectionname(date: number, name: string, highPoint?: number | null) {
    const trCode = await this.trCodeRepository.findOne({ where: { name: name } });
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
  async findOneByTrCode(trcode: string) {
    const trCode = await this.trCodeRepository.findOne({ where: { code: trcode } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    const stockData = await this.stockDataRepository.find({ where: { trCode: { id: trCode.id } } });
    const peakDates = await this.peakDateRepository.find({ where: { trCode: { id: trCode.id } } });
    const filteredPeaks = await this.filteredPeakRepository.find({ where: { trCode: { id: trCode.id } } });
    const userInflections = await this.userInflectionRepository.find({ where: { trCode: { id: trCode.id } } });

    return { trCode, stockData, peakDates, filteredPeaks, userInflections };

  }
  //주식,고점,변곡점,변곡점 설정 데이터 가져오기(stock_name으로 조회)
  async findOneByStockName(stockName: string) {
    const trCode = await this.trCodeRepository.findOne({ where: { name: stockName } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    const stockData = await this.stockDataRepository.find({ where: { trCode: { id: trCode.id } } });
    const peakDates = await this.peakDateRepository.find({ where: { trCode: { id: trCode.id } } });
    const filteredPeaks = await this.filteredPeakRepository.find({ where: { trCode: { id: trCode.id } } });
    const userInflections = await this.userInflectionRepository.find({ where: { trCode: { id: trCode.id } } });

    return { trCode, stockData, peakDates, filteredPeaks, userInflections };
  }


  //인증 여부 업데이트 함수(tr_code로 조회)
  async updateCertifiedTrCode(code: string) {
    const trCode = await this.trCodeRepository.findOne({ where: { code: code } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    trCode.certified = true;
    return await this.trCodeRepository.save(trCode);
  }

  //인증 여부 업데이트 함수(stock_name으로 조회)
  async updateCertifiedStockName(name: string) {
    const trCode = await this.trCodeRepository.findOne({ where: { name: name } });
    if (!trCode) {
      return { message: 'No stock code or name provided' };
    }
    trCode.certified = true;
    return await this.trCodeRepository.save(trCode);
  }
  //인증이 안된 종목 조회
  async getFalseCertified() {
    const uncertifiedTrCodes = await this.trCodeRepository.find({ where: { certified: false }, relations: ['peakDates', 'filteredPeaks'] });

    const results = uncertifiedTrCodes.filter(trCode => trCode.peakDates.length > 0 && trCode.filteredPeaks.length > 0);

    return results;
  }

  update(id: number, updateStockDatumDto: UpdateStockDatumDto) {
    return `This action updates a #${id} stockDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockDatum`;
  }
}
