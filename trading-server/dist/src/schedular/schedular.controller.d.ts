import { SchedularService } from './schedular.service';
import { UpdateSchedularDto } from './dto/update-schedular.dto';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './SessionService';
import { ClientProxy } from '@nestjs/microservices';
export declare class SchedularController {
    private readonly schedularService;
    private configService;
    private readonly sessionService;
    private readonly redisClient;
    constructor(schedularService: SchedularService, configService: ConfigService, sessionService: SessionService, redisClient: ClientProxy);
    private readonly appkey;
    private readonly appsecret;
    CreateAuthHashKey(): void;
    CreateAccessToken(): void;
    CreateWebSocketToken(): void;
    getWeeklyStockData(): Promise<void>;
    StockData(): Promise<void>;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateSchedularDto: UpdateSchedularDto): string;
    remove(id: string): string;
}
