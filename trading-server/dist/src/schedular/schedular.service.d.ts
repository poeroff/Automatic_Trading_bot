import { SessionService } from './SessionService';
import { ClientProxy } from '@nestjs/microservices';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Repository } from 'typeorm';
import { DayStockData } from 'src/stock-data/entities/DayStockData.entity';
import { WeekStockData } from 'src/stock-data/entities/WeekStockData.entity';
export declare class SchedularService {
    private readonly koreastockcodeRepository;
    private readonly daystockdataRepository;
    private readonly weekstockdataRepository;
    private readonly sessionService;
    private readonly redisClient;
    constructor(koreastockcodeRepository: Repository<KoreanStockCode>, daystockdataRepository: Repository<DayStockData>, weekstockdataRepository: Repository<WeekStockData>, sessionService: SessionService, redisClient: ClientProxy);
    today: Date;
    year: string;
    month: string;
    day: string;
    todayStr: string;
    createAuthHashKey(url: any, headers: any, data: any): Promise<void>;
    createAccessToken(url: any, headers: any, data: any): Promise<void>;
    createWebSocketToken(url: any, headers: any, data: any): Promise<void>;
    alldayStockData(url: any, headers: any): Promise<void>;
    dayStockData(url: any, headers: any): Promise<void>;
    weekStockData(url: any, headers: any): Promise<void>;
    stockData(url: any, headers: any, data: any): Promise<any>;
}
