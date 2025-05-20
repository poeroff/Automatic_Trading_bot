import { StockRankingsService } from './stock-rankings.service';
import { UpdateStockRankingDto } from './dto/update-stock-ranking.dto';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
export declare class StockRankingsController {
    private readonly stockRankingsService;
    private configService;
    private readonly redisClient;
    constructor(stockRankingsService: StockRankingsService, configService: ConfigService, redisClient: ClientProxy);
    private readonly appkey;
    private readonly appsecret;
    tradingvolume(): Promise<any>;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateStockRankingDto: UpdateStockRankingDto): string;
    remove(id: string): string;
}
