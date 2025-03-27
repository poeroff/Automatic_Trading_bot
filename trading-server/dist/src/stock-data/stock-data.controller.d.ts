import { StockDataService } from './stock-data.service';
export declare class StockDataController {
    private readonly stockDataService;
    constructor(stockDataService: StockDataService);
    getAllCodes(): Promise<import("./entities/KoreanStockCode.entity").KoreanStockCode[]>;
    getStockData(body: {
        code: string;
    }): Promise<{
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
    getUserInflection(body: {
        code: string;
    }): Promise<import("./entities/user-inflection.entity").UserInflection[] | {
        message: string;
    }>;
    createUserInflection(body: {
        date: number;
        highPoint?: number | null;
        code?: string;
        name?: string;
    }): Promise<{
        message: string;
    } | undefined> | Promise<import("./entities/user-inflection.entity").UserInflection | {
        message: string;
    }> | undefined;
    deleteUserInflection(body: {
        id: number;
    }): Promise<import("typeorm").DeleteResult>;
    getstockPoint(code?: string, name?: string): Promise<{
        Company: import("./entities/KoreanStockCode.entity").KoreanStockCode;
        StockData: import("./entities/DayStockData.entity").DayStockData[];
        PeakDates: import("./entities/PeakDate.entity").PeakDate[];
        FilteredPeaks: import("./entities/filtered-peaks.entity").FilteredPeak[];
        UserInflections: import("./entities/user-inflection.entity").UserInflection[];
    }> | {
        message: string;
    };
    getFalseCertified(): Promise<import("./entities/KoreanStockCode.entity").KoreanStockCode[]>;
}
