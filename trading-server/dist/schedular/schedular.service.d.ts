import { UpdateSchedularDto } from './dto/update-schedular.dto';
import { SessionService } from './SessionService';
import { ClientProxy } from '@nestjs/microservices';
export declare class SchedularService {
    private readonly sessionService;
    private readonly redisClient;
    constructor(sessionService: SessionService, redisClient: ClientProxy);
    CreateAuthHashKey(url: any, headers: any, data: any): Promise<void>;
    CreateAccessToken(url: any, headers: any, data: any): Promise<void>;
    CreateWebSocketToken(url: any, headers: any, data: any): Promise<void>;
    getWeeklyStockData(url: any, headers: any, params: any): Promise<any>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateSchedularDto: UpdateSchedularDto): string;
    remove(id: number): string;
}
