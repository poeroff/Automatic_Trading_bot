import { UpdateLiveIndexDto } from './dto/update-live_index.dto';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
export declare class LiveIndexService {
    private configService;
    private readonly redisClient;
    constructor(configService: ConfigService, redisClient: ClientProxy);
    private readonly appkey;
    private readonly appsecret;
    getCurrentDate: () => string;
    Korea_main_stock_marketIndex(): Promise<{
        kospi: {
            bstp_nmix_prpr: any;
            bstp_nmix_prdy_vrss: any;
            bstp_nmix_prdy_ctrt: any;
        };
        kosdak: {
            bstp_nmix_prpr: any;
            bstp_nmix_prdy_vrss: any;
            bstp_nmix_prdy_ctrt: any;
        };
        kospi200: {
            bstp_nmix_prpr: any;
            bstp_nmix_prdy_vrss: any;
            bstp_nmix_prdy_ctrt: any;
        };
        exchange_rate_USD: {
            ovrs_nmix_prpr: any;
            ovrs_nmix_prdy_vrss: any;
            prdy_ctrt: any;
        };
        exchange_rate_JPY: {
            ovrs_nmix_prpr: any;
            ovrs_nmix_prdy_vrss: any;
            prdy_ctrt: any;
        };
    }>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateLiveIndexDto: UpdateLiveIndexDto): string;
    remove(id: number): string;
}
