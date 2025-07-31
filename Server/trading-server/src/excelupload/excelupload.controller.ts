import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpException, HttpStatus, Inject } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ExceluploadService } from './excelupload.service';
import { CreateExceluploadDto } from './dto/create-excelupload.dto';
import { UpdateExceluploadDto } from './dto/update-excelupload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpStatusCode } from 'axios';
import { RedisClient } from 'ioredis/built/connectors/SentinelConnector/types';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Controller('excelupload')
export class ExceluploadController {

  constructor(private readonly exceluploadService: ExceluploadService, @Inject("REDIS_CLIENT") private readonly redisClient : ClientProxy,private configService : ConfigService,) {}
  private readonly appkey = this.configService.get<string>('appkey')
  private readonly appsecret = this.configService.get<string>('appsecret')
  private readonly baseUrl = this.configService.get<string>('baseUrl')

  //기업공시채널에서 엑셀 파일 올리면 db에 값 넣어주는 기능(.xlsx만 지원)(한국 주식 데이터 삽입입)
  @Post("korea")
  @UseInterceptors(FileInterceptor("file"))
  async koreanStockuUploadExcel(@UploadedFile() file){
  
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    // 파일명이 .xlsx로 끝나지 않으면 에러 발생
    if (!file.originalname.endsWith('.xlsx')) {
      throw new HttpException('Only .xlsx files are allowed', HttpStatus.BAD_REQUEST);
    }

    const fileName = file.originalname.toLowerCase(); // 대소문자 구분 없이 확인
    const stockMarket = fileName.includes('kospi') ? 'STK' : 'KSQ';


    // 엑셀 파일 읽기
    const workbook = XLSX.read(file.buffer, { type: 'buffer' ,codepage: 949, raw : true});
    // 첫 번째 시트 이름
    const sheetName = workbook.SheetNames[0]; 
    //특정 행 이름 바꿔주기기("A1, B1 ....")
    const worksheet = workbook.Sheets[sheetName];
    worksheet['A1'] = { v: 'company' };
    worksheet['B1'] = { v: 'code' };
    worksheet['C1'] = { v: 'category' };
    worksheet['D1'] = { v: 'products' };
    worksheet['E1'] = { v: 'listed_date' };
    worksheet['F1'] = { v: 'settlement_month' };
    worksheet['G1'] = { v: 'representative' };
    worksheet['H1'] = { v: 'homepage' };
    worksheet['I1'] = { v: 'region' };

    this.exceluploadService.koreanStockReadExcel(worksheet, stockMarket);
  }

  @Post("USA")
  @UseInterceptors(FileInterceptor("file"))
  usaStockuUploadExcel() {
    return this.exceluploadService.findAll();
  }


}
