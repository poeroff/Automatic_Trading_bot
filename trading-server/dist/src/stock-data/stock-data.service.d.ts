import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { Repository } from 'typeorm';
import { DayStockData } from './entities/DayStockData.entity';
import { TrCode } from './entities/tr-code.entity';
import { PeakDate } from './entities/peak-dates.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/filtered-peaks.entity';
import { UserInflection } from './entities/user-inflection.entity';
export declare class StockDataService {
    private stockDataRepository;
    private trCodeRepository;
    private peakDateRepository;
    private peakPriceRepository;
    private filteredPeakRepository;
    private userInflectionRepository;
    constructor(stockDataRepository: Repository<DayStockData>, trCodeRepository: Repository<TrCode>, peakDateRepository: Repository<PeakDate>, peakPriceRepository: Repository<PeakPrice>, filteredPeakRepository: Repository<FilteredPeak>, userInflectionRepository: Repository<UserInflection>);
    create(createStockDatumDto: CreateStockDatumDto): string;
    getAllCodes(): Promise<TrCode[]>;
    gettrueCodes(): Promise<TrCode[]>;
    getStockData(code: string): Promise<void>;
    getUserInflection(code: string): Promise<UserInflection[] | {
        message: string;
    }>;
    createUserInflectioncode(date: number, code: string, highPoint?: number | null): Promise<{
        message: string;
    } | undefined>;
    createUserInflectionname(date: number, name: string, highPoint?: number | null): Promise<UserInflection | {
        message: string;
    }>;
    deleteUserInflection(id: number): Promise<import("typeorm").DeleteResult>;
    findOneByTrCode(trcode: string): Promise<{
        message: string;
    } | undefined>;
    findOneByStockName(stockName: string): Promise<{
        message: string;
    } | undefined>;
    updateCertifiedTrCode(code: string): Promise<TrCode | {
        message: string;
    }>;
    updateCertifiedStockName(name: string): Promise<TrCode | {
        message: string;
    }>;
    getFalseCertified(): Promise<TrCode[]>;
    update(id: number, updateStockDatumDto: UpdateStockDatumDto): string;
    remove(id: number): string;
}
