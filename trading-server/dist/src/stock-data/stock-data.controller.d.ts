import { StockDataService } from './stock-data.service';
export declare class StockDataController {
    private readonly stockDataService;
    constructor(stockDataService: StockDataService);
    GetTrueCode(): Promise<import("./entities/KoreanStockCode.entity").KoreanStockCode[]>;
    StockData(body: {
        code: string;
    }): Promise<{
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
    getAllCodes(): Promise<import("./entities/KoreanStockCode.entity").KoreanStockCode[]>;
    getUserInflection(body: {
        code: string;
    }): Promise<import("./entities/user-inflection.entity").UserInflection[] | {
        message: string;
    }>;
    createUserInflection(body: {
        date: number;
        highPoint: number;
        code?: string;
        name?: string;
    }): Promise<import("./entities/user-inflection.entity").UserInflection | {
        message: string;
    }> | undefined;
    deleteUserInflection(body: {
        id: number;
    }): Promise<import("typeorm").DeleteResult>;
    getstockPoint(code?: string, name?: string): Promise<{
        Company: import("./entities/KoreanStockCode.entity").KoreanStockCode;
        StockData: import("./entities/DayStockData.entity").DayStockData[];
        PeakDates: import("./entities/PeakDate.entity").PeakDate[];
        FilteredPeaks: import("./entities/FilterPeak.entity").FilteredPeak[];
        UserInflections: import("./entities/user-inflection.entity").UserInflection[];
    }> | {
        message: string;
    };
    GetFalseCertified(): Promise<import("./entities/KoreanStockCode.entity").KoreanStockCode[]>;
    ReturnHighPeak(body: {
        code: number;
    }): Promise<import("./entities/PeakDate.entity").PeakDate[]>;
    ReturnInflectionPoint(body: {
        code: number;
    }): Promise<import("./entities/user-inflection.entity").UserInflection[]>;
}
