import { StockDataService } from './stock-data.service';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
export declare class StockDataController {
    private readonly stockDataService;
    constructor(stockDataService: StockDataService);
    create(createStockDatumDto: CreateStockDatumDto): string;
    findAll(): string;
    createUserInflection(body: {
        date: number;
        code?: string;
        name?: string;
    }): Promise<import("./entities/user-inflection.entity").UserInflection | {
        message: string;
    }> | undefined;
    deleteUserInflection(body: {
        id: number;
    }): Promise<import("typeorm").DeleteResult>;
    findOne(code?: string, name?: string): Promise<{
        message: string;
        trCode?: undefined;
        stockData?: undefined;
        peakDates?: undefined;
        filteredPeaks?: undefined;
        userInflections?: undefined;
    } | {
        trCode: import("./entities/tr-code.entity").TrCode;
        stockData: import("./entities/stock-datum.entity").StockData[];
        peakDates: import("./entities/peak-dates.entity").PeakDate[];
        filteredPeaks: import("./entities/filtered-peaks.entity").FilteredPeak[];
        userInflections: import("./entities/user-inflection.entity").UserInflection[];
        message?: undefined;
    }> | {
        message: string;
    };
    update(id: string, updateStockDatumDto: UpdateStockDatumDto): string;
    remove(id: string): string;
}
