import { UpdateLiveIndexDto } from './dto/update-live_index.dto';
import { SessionService } from 'src/schedular/SessionService';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
export declare class LiveIndexService {
    private readonly sessionService;
    private configService;
    private readonly redisClient;
    constructor(sessionService: SessionService, configService: ConfigService, redisClient: ClientProxy);
    private readonly appkey;
    private readonly appsecret;
    KospiIndex(): Promise<any>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateLiveIndexDto: UpdateLiveIndexDto): string;
    remove(id: number): string;
}
