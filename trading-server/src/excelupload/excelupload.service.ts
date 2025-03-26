import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CreateExceluploadDto } from './dto/create-excelupload.dto';
import { UpdateExceluploadDto } from './dto/update-excelupload.dto';
import path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExceluploadService {
  constructor(@InjectRepository(KoreanStockCode) private koreanstockcoderepository: Repository<KoreanStockCode>) { }

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
  ];


  async readExcel(worksheet: XLSX.WorkSheet) {
    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? "");
    const startRow = 1; // 2번째 줄 (0-indexed이므로 1)
    const startCol = 0; // A 열 (0-indexed)
    const endCol = 8; // I 열 (0-indexed)

    for (let rowNum = startRow; rowNum <= range.e.r; rowNum++) {
      const rowValues: any[] = [];
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
      if (typeof rowValues[0] === 'string') {
        const companyName = rowValues[0];
        if (this.filterWords.some(word => companyName.includes(word))) {
          continue;
        }
      }
      const companynmame = await this.koreanstockcoderepository.findOne({ where: { company: rowValues[0] } })
      if (!companynmame) {
        await this.koreanstockcoderepository.save({ company: rowValues[0], code: rowValues[1], category: rowValues[2], products: rowValues[3], listed_date: rowValues[4], settlement_month: rowValues[5], representative: rowValues[6], homepage: rowValues[7], region: rowValues[8] })
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
