import * as XLSX from 'xlsx';
import { UpdateExceluploadDto } from './dto/update-excelupload.dto';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Repository } from 'typeorm';
export declare class ExceluploadService {
    private koreanstockcoderepository;
    constructor(koreanstockcoderepository: Repository<KoreanStockCode>);
    excelDateToJSDate(date: number): Date;
    formatJSDate(jsDate: Date): string;
    filterWords: string[];
    readExcel(worksheet: XLSX.WorkSheet): Promise<void>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateExceluploadDto: UpdateExceluploadDto): string;
    remove(id: number): string;
}
