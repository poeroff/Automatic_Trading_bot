import { Repository } from 'typeorm';
import { DayStockData } from './entities/DayStockData.entity';
import { PeakDate } from './entities/PeakDate.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/FilterPeak.entity';
import { UserInflection } from './entities/UserInflection.entity';
import { KoreanStockCode } from './entities/KoreanStockCode.entity';
export declare class StockDataService {
    private DayStockDataRepository;
    private KoreanStockCodeRepository;
    private peakDateRepository;
    private peakPriceRepository;
    private filteredPeakRepository;
    private userInflectionRepository;
    constructor(DayStockDataRepository: Repository<DayStockData>, KoreanStockCodeRepository: Repository<KoreanStockCode>, peakDateRepository: Repository<PeakDate>, peakPriceRepository: Repository<PeakPrice>, filteredPeakRepository: Repository<FilteredPeak>, userInflectionRepository: Repository<UserInflection>);
    trueCode(): Promise<KoreanStockCode[]>;
    createUserInflectioncode(date: number, code: string, highPoint?: number | null): Promise<UserInflection | {
        message: string;
    }>;
    createUserInflectionname(date: number, name: string, highPoint?: number | null): Promise<UserInflection | {
        message: string;
    }>;
    deleteUserInflection(id: number): Promise<import("typeorm").DeleteResult>;
    stockPoint(stock: any): Promise<{
        Company: KoreanStockCode;
        StockData: DayStockData[];
        PeakDates: PeakDate[];
        FilteredPeaks: FilteredPeak[];
        UserInflections: UserInflection[];
    }>;
    updateCertifiedTrCode(code: string): Promise<KoreanStockCode | {
        message: string;
    }>;
    falseCertified(): Promise<KoreanStockCode[]>;
    returnHighPeak(code: number): Promise<PeakDate[]>;
    returnInflectionPoint(code: number): Promise<UserInflection[]>;
    StockData(code: string): Promise<{
        Data: {
            date: string;
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
            is_high_point: boolean;
        }[];
    }>;
}
