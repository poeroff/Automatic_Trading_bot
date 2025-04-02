import { ExceluploadService } from './excelupload.service';
import { UpdateExceluploadDto } from './dto/update-excelupload.dto';
export declare class ExceluploadController {
    private readonly exceluploadService;
    constructor(exceluploadService: ExceluploadService);
    koreanStockuUploadExcel(file: any): Promise<void>;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateExceluploadDto: UpdateExceluploadDto): string;
    remove(id: string): string;
}
