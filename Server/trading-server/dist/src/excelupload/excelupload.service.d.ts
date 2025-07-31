import * as XLSX from 'xlsx';
import { UpdateExceluploadDto } from './dto/update-excelupload.dto';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DayStockData } from 'src/stock-data/entities/DayStockData.entity';
export declare class ExceluploadService {
    private koreanstockcoderepository;
    private DayStockRepository;
    private readonly redisClient;
    private configService;
    constructor(koreanstockcoderepository: Repository<KoreanStockCode>, DayStockRepository: Repository<DayStockData>, redisClient: ClientProxy, configService: ConfigService);
    private readonly appkey;
    private readonly appsecret;
    filterWords: string[];
    excelDateToJSDate(date: number): Date;
    formatJSDate(jsDate: Date): string;
    check_revenue(code: string, mket_id_cd: string): Promise<{
        result: string;
    }>;
    isCapitalImpaired(code: string): Promise<{
        result: string;
    }>;
    koreanStockReadExcel(worksheet: XLSX.WorkSheet, stockMarket: any): Promise<void>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateExceluploadDto: UpdateExceluploadDto): string;
    remove(id: number): string;
}
