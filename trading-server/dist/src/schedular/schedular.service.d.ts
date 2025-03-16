import { UpdateSchedularDto } from './dto/update-schedular.dto';
import { SessionService } from './SessionService';
import { ClientProxy } from '@nestjs/microservices';
import { Kospi } from 'src/stock-data/entities/Kospi.entity';
import { Repository } from 'typeorm';
import { StockData } from 'src/stock-data/entities/stock-data.entity';
export declare class SchedularService {
    private readonly KospiRepository;
    private readonly stockdataRepository;
    private readonly sessionService;
    private readonly redisClient;
    constructor(KospiRepository: Repository<Kospi>, stockdataRepository: Repository<StockData>, sessionService: SessionService, redisClient: ClientProxy);
    today: Date;
    year: string;
    month: string;
    day: string;
    todayStr: string;
    CreateAuthHashKey(url: any, headers: any, data: any): Promise<void>;
    CreateAccessToken(url: any, headers: any, data: any): Promise<void>;
    CreateWebSocketToken(url: any, headers: any, data: any): Promise<void>;
    getWeeklyStockData(url: any, headers: any): Promise<void>;
    StockData(url: any, headers: any, data: any): Promise<any>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateSchedularDto: UpdateSchedularDto): string;
    remove(id: number): string;
}
