import { UpdateSignalDto } from './dto/update-signal.dto';
import { Repository } from 'typeorm';
import { KoreanStockCode } from 'src/stock-data/entities/KoreanStockCode.entity';
import { Alert } from 'src/stock-data/entities/Alert.entity';
import { EventsGateway } from 'src/gateway/events.gateway';
export declare class SignalsService {
    private AlertRepository;
    private KoreanStockCodeRepository;
    private readonly EventsGateway;
    constructor(AlertRepository: Repository<Alert>, KoreanStockCodeRepository: Repository<KoreanStockCode>, EventsGateway: EventsGateway);
    signalscreate(code: string, price: number): Promise<Alert>;
    triggerStockSignal(url: any, headers: any): Promise<Alert[]>;
    triggerStockSignals(): Promise<Alert[]>;
    findOne(id: number): string;
    update(id: number, updateSignalDto: UpdateSignalDto): string;
    remove(id: number): string;
}
