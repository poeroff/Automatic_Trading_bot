import { StockDataService } from './stock-data.service';
export declare class StockDataController {
    private readonly stockDataService;
    constructor(stockDataService: StockDataService);
    trueCode(): Promise<import("./entities/KoreanStockCode.entity").KoreanStockCode[]>;
    falseCertified(): Promise<import("./entities/KoreanStockCode.entity").KoreanStockCode[]>;
    createUserInflection(body: {
        date: number;
        highPoint: number;
        code?: string;
        name?: string;
    }): Promise<import("./entities/UserInflection.entity").UserInflection | {
        message: string;
    }> | undefined;
    stockPoint(code?: string, name?: string): Promise<{
        Company: import("./entities/KoreanStockCode.entity").KoreanStockCode;
        StockData: import("./entities/DayStockData.entity").DayStockData[];
        PeakDates: import("./entities/PeakDate.entity").PeakDate[];
        FilteredPeaks: import("./entities/FilterPeak.entity").FilteredPeak[];
        UserInflections: import("./entities/UserInflection.entity").UserInflection[];
    }> | {
        message: string;
    };
    deleteUserInflection(body: {
        id: number;
    }): Promise<import("typeorm").DeleteResult>;
    returnHighPeak(body: {
        code: number;
    }): Promise<import("./entities/PeakDate.entity").PeakDate[]>;
    returnInflectionPoint(body: {
        code: number;
    }): Promise<import("./entities/UserInflection.entity").UserInflection[]>;
    stockData(body: {
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
}
