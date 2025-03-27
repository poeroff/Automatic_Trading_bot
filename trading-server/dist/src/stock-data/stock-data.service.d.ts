import { Repository } from 'typeorm';
import { DayStockData } from './entities/DayStockData.entity';
import { PeakDate } from './entities/PeakDate.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/filtered-peaks.entity';
import { UserInflection } from './entities/user-inflection.entity';
import { KoreanStockCode } from './entities/KoreanStockCode.entity';
export declare class StockDataService {
    private DayStockDataRepository;
    private KoreanStockCodeRepository;
    private peakDateRepository;
    private peakPriceRepository;
    private filteredPeakRepository;
    private userInflectionRepository;
    constructor(DayStockDataRepository: Repository<DayStockData>, KoreanStockCodeRepository: Repository<KoreanStockCode>, peakDateRepository: Repository<PeakDate>, peakPriceRepository: Repository<PeakPrice>, filteredPeakRepository: Repository<FilteredPeak>, userInflectionRepository: Repository<UserInflection>);
    getAllCodes(): Promise<KoreanStockCode[]>;
    getStockData(code: string): Promise<{
        status: string;
        message: string;
        Data?: undefined;
    } | {
        Data: {
            Date: string;
            Open: number;
            High: number;
            Low: number;
            Close: number;
            Volume: number;
        }[];
        status?: undefined;
        message?: undefined;
    }>;
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
    getstockPoint(stock: any): Promise<{
        Company: KoreanStockCode;
        StockData: DayStockData[];
        PeakDates: PeakDate[];
        FilteredPeaks: FilteredPeak[];
        UserInflections: UserInflection[];
    }>;
    updateCertifiedTrCode(code: string): Promise<KoreanStockCode | {
        message: string;
    }>;
    getFalseCertified(): Promise<KoreanStockCode[]>;
}
