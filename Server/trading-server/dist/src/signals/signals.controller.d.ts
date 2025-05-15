import { SignalsService } from './signals.service';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
export declare class SignalsController {
    private readonly signalsService;
    private configService;
    private readonly redisClient;
    constructor(signalsService: SignalsService, configService: ConfigService, redisClient: ClientProxy);
    private readonly appkey;
    private readonly appsecret;
    signalscreate(body: {
        code: string;
        price: number;
    }): Promise<import("../stock-data/entities/Alert.entity").Alert>;
    triggerStockSignal(): Promise<import("../stock-data/entities/Alert.entity").Alert[]>;
    triggerStockSignals(): Promise<import("../stock-data/entities/Alert.entity").Alert[]>;
    findOne(id: string): string;
    update(id: string, updateSignalDto: UpdateSignalDto): string;
    remove(id: string): string;
}
