import { SchedularService } from './schedular.service';
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
    createAuthHashKey(): void;
    createAccessToken(): void;
    createWebSocketToken(): void;
    alldayStockData(): Promise<void>;
    dayStockData(): Promise<void>;
    weekStockData(): Promise<void>;
    stockData(): Promise<void>;
}
