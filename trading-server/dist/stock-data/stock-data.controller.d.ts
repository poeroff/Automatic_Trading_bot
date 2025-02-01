import { StockDataService } from './stock-data.service';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
export declare class StockDataController {
    private readonly stockDataService;
    constructor(stockDataService: StockDataService);
    create(createStockDatumDto: CreateStockDatumDto): string;
    findAll(): string;
    findOne(code?: string, name?: string): Promise<string> | Promise<{
        message: string;
        trCode?: undefined;
        stockData?: undefined;
        peakDates?: undefined;
        peakPrices?: undefined;
        filteredPeaks?: undefined;
    } | {
        trCode: import("./entities/tr-code.entity").TrCode;
        stockData: import("./entities/stock-datum.entity").StockData[];
        peakDates: import("./entities/peak-dates.entity").PeakDate[];
        peakPrices: import("./entities/PeakPrice.entity").PeakPrice[];
        filteredPeaks: import("./entities/filtered-peaks.entity").FilteredPeak[];
        message?: undefined;
    }> | {
        message: string;
    };
    update(id: string, updateStockDatumDto: UpdateStockDatumDto): string;
    remove(id: string): string;
}
