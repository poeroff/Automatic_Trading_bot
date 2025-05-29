import { Inject, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CreateExceluploadDto } from './dto/create-excelupload.dto';
import { UpdateExceluploadDto } from './dto/update-excelupload.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Repository } from 'typeorm';

import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { bool, number } from 'joi';
import axiosRetry from 'axios-retry';
import { Get } from 'utils/axios_get';
import { DayStockData } from 'src/stock-data/entities/DayStockData.entity';

@Injectable()
export class ExceluploadService {
  constructor(@InjectRepository(KoreanStockCode) private koreanstockcoderepository: Repository<KoreanStockCode>, 
  @InjectRepository(DayStockData) private DayStockRepository: Repository<DayStockData>, 
  @Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy,
  private configService: ConfigService) { }
  private readonly appkey = this.configService.get<string>('appkey')
  private readonly appsecret = this.configService.get<string>('appsecret')

  

  //한국주식 etf등 기업주식이 아닌 종목들 필터 조건건
  filterWords = [
    'ETF', 'ETN', '선물',
    'KODEX', 'TIGER', 'KBSTAR',
    'SOL', 'ACE', 'VITA',
    'HANARO', 'KOSEF', 'KINDEX',
    'ARIRANG', 'SMART', 'FOCUS',
    'TIMEFOLIO', 'WOORI',
    '우B', '우C',
    '레버리지', '인버스',
    'KoAct', '채권', '스팩', 'PLUS',
    'RISE', 'KIWOOM', 'BNK', 'WON',
    '마이다스', '에셋플러스', 'KCGI', '리츠',
    '액티브', '인프라', '고배당'
  ]


  excelDateToJSDate(date: number) {
    const jsDate = new Date((date - 25569) * 86400000);
    return jsDate;
  }

  formatJSDate(jsDate: Date) {
    const year = jsDate.getFullYear();
    const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
    const day = jsDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // 매출액 확인 
  async check_revenue(code : string, mket_id_cd: string){
    const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const url ="https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/finance/income-statement"
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': savedToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHKST66430200', // 주식 차트 데이터 요청 ID
      "custtype": "P",
      "tr_cont": "M"
    };
    const params = {
      FID_DIV_CLS_CODE: '1', // 주식 
      fid_cond_mrkt_div_code: "J", // 종목 코드 (예: 005930 - 삼성전자)
      fid_input_iscd: code
    };
    const response = await Get(url,headers,params)

    if(response.data.output.length > 0){
      if(mket_id_cd =="STK"){
        if(Number(response.data.output[0].sale_account) >= 300 && Number(response.data.output[0].bsop_prti) >= 30 ){
          return {
            result :"N"
          }
        }
        return {
          result :"Y"
        }
      }
      else if(mket_id_cd =="KSQ"){
        if(Number(response.data.output[0].sale_account) >= 100 && Number(response.data.output[0].bsop_prti) >= 10 ){
          return {
            result :"N"
          }
        }
        return {
          result :"Y"
        }
      }
    }
    return {
      result :"N"
    }
  }

  // 자본 잠식률 0% 이상인지 여부 확인(true, false 반환환)
  async isCapitalImpaired(code: string) {
   
    const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/finance/balance-sheet"
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': savedToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHKST66430100', // 주식 차트 데이터 요청 ID
      "custtype": "P",
      "tr_cont": "M"
    };
    const params = {
      FID_DIV_CLS_CODE: '1', // 주식 
      fid_cond_mrkt_div_code: "J", // 종목 코드 (예: 005930 - 삼성전자)
      fid_input_iscd: code
    };
    const response = await Get(url,headers,params)
 

    if (response.data.output.length > 0) {
      const cpfn = Number(response.data.output[0].cpfn); // 자본금 (단위 맞춰서 변환)
      const total_cptl = Number(response.data.output[0].total_cptl); // 자본총계
      const erosionRate = total_cptl < cpfn ? ((cpfn - total_cptl) / cpfn) * 100 : 0

      if (erosionRate > 0) {
        return {
          result : "Y"
        }
      }
      return {
        result : "N"
      }
    }
    return {
      result : "N"
    }
  }
  // 시가 총액 미달 여부 확인(코스피 : 625억 코스닥 : 375억)
  async is_below_market_cap_threshold(url: string , headers ,code : string ){
  
    const params = {
      PRDT_TYPE_CD: '300', // 주식 
      PDNO: code, // 종목 코드 (예: 005930 - 삼성전자)
    };
    const response = await Get(url,headers,params)

    const lstg_stqt = response.data.output.lstg_stqt //상장 주수
    const bfdy_clpr = response.data.output.bfdy_clpr //전일 종가
    const market_capitalization = lstg_stqt * bfdy_clpr
    if(response.data.output.mket_id_cd=="STK"){
      if(market_capitalization >= 62_500_000_000){
     
        return {
          result: "N",
          mket_id_cd: response.data.output.mket_id_cd,
          admn_item_yn :  response.data.output.admn_item_yn,
          tr_stop_yn :  response.data.output.tr_stop_yn
        };
      }
   
      return {
        result: "Y",
        mket_id_cd: response.data.output.mket_id_cd,
        admn_item_yn :  response.data.output.admn_item_yn,
        tr_stop_yn :  response.data.output.tr_stop_yn
      };
    }
    else if(response.data.output.mket_id_cd=="KSQ"){
      if(market_capitalization >= 37_500_000_000){
   
        return {
          result: "N",
          mket_id_cd: response.data.output.mket_id_cd,
          admn_item_yn :  response.data.output.admn_item_yn,
          tr_stop_yn :  response.data.output.tr_stop_yn
        };
      }
  
      return {
        result: "Y",
        mket_id_cd: response.data.output.mket_id_cd,
        admn_item_yn :  response.data.output.admn_item_yn,
        tr_stop_yn :  response.data.output.tr_stop_yn
      };
    }
   
  }


  async koreanStockReadExcel(worksheet: XLSX.WorkSheet, headers, url) {

    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? "");
    const startRow = 1; // 2번째 줄 (0-indexed이므로 1)
    const startCol = 0; // A 열 (0-indexed)
    const endCol = 8; // I 열 (0-indexed)

    for (let rowNum = startRow; rowNum <= range.e.r; rowNum++) {
    //for (let rowNum = startRow; rowNum <= 1; rowNum++) {
      const rowValues: any[] = [];
      //엑셀에 있는 모든 데이터 수집
      for (let colNum = startCol; colNum <= endCol; colNum++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
        let cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : null;
        // 날짜 형식일 경우 변환
        if (typeof cellValue === 'number') {
          const jsDate = this.excelDateToJSDate(cellValue);
          cellValue = this.formatJSDate(jsDate);
        }
        rowValues.push(cellValue);
      }

      
      //filterWords에 들어간 단어는 제외하고 나머지 데이터만 넣는다 
      if (typeof rowValues[0] === 'string') {
        const companyName = rowValues[0];
        if (this.filterWords.some(word => companyName.includes(word))) {
          continue;
        }
      }
      const Company = await this.koreanstockcoderepository.findOne({ where: { company: rowValues[0] } })
      const CapitalImpaired = await this.isCapitalImpaired(rowValues[1])
      const market_cap = await this.is_below_market_cap_threshold(url,headers,rowValues[1]);
      const check_revenue = await this.check_revenue(rowValues[1], market_cap?.mket_id_cd)

      //엑셀을 통해 데이터를 삽입할때 이미 있는 종목은 db에 넣지 않는다 (중복 제거)
      if (!Company) {
          await this.koreanstockcoderepository.save({ company: rowValues[0], code: rowValues[1], category: rowValues[2], products: rowValues[3], listed_date: rowValues[4], settlement_month: rowValues[5], representative: rowValues[6], homepage: rowValues[7], region: rowValues[8], mket_id_cd: market_cap?.mket_id_cd, mcap : market_cap?.result, capital_Impairment :  CapitalImpaired.result, admn_item_yn : market_cap?.admn_item_yn, tr_stop_yn : market_cap?.tr_stop_yn, sale_account : check_revenue.result })
      }
      else if(Company){
        await this.koreanstockcoderepository.update({ code: rowValues[1] }, { mket_id_cd: market_cap?.mket_id_cd, mcap : market_cap?.result, capital_Impairment :  CapitalImpaired.result, admn_item_yn : market_cap?.admn_item_yn, tr_stop_yn : market_cap?.tr_stop_yn, sale_account : check_revenue.result })
        }
    }
  }
  findAll() {
    return `This action returns all excelupload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} excelupload`;
  }

  update(id: number, updateExceluploadDto: UpdateExceluploadDto) {
    return `This action updates a #${id} excelupload`;
  }

  remove(id: number) {
    return `This action removes a #${id} excelupload`;
  }
}
