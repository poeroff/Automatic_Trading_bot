import { ExceluploadService } from './excelupload.service';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
export declare class ExceluploadController {
    private readonly exceluploadService;
    private readonly redisClient;
    private configService;
    constructor(exceluploadService: ExceluploadService, redisClient: ClientProxy, configService: ConfigService);
    private readonly appkey;
    private readonly appsecret;
    private readonly baseUrl;
    koreanStockuUploadExcel(file: any): Promise<void>;
    usaStockuUploadExcel(): string;
}
