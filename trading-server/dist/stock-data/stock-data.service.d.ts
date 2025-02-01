import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { Repository } from 'typeorm';
import { StockData } from './entities/stock-datum.entity';
import { TrCode } from './entities/tr-code.entity';
import { PeakDate } from './entities/peak-dates.entity';
import { PeakPrice } from './entities/PeakPrice.entity';
import { FilteredPeak } from './entities/filtered-peaks.entity';
export declare class StockDataService {
    private stockDataRepository;
    private trCodeRepository;
    private peakDateRepository;
    private peakPriceRepository;
    private filteredPeakRepository;
    constructor(stockDataRepository: Repository<StockData>, trCodeRepository: Repository<TrCode>, peakDateRepository: Repository<PeakDate>, peakPriceRepository: Repository<PeakPrice>, filteredPeakRepository: Repository<FilteredPeak>);
    create(createStockDatumDto: CreateStockDatumDto): string;
    findAll(): string;
    findOneByTrCode(trcode: string): Promise<{
        message: string;
        trCode?: undefined;
        stockData?: undefined;
        peakDates?: undefined;
        peakPrices?: undefined;
        filteredPeaks?: undefined;
    } | {
        trCode: TrCode;
        stockData: StockData[];
        peakDates: PeakDate[];
        peakPrices: PeakPrice[];
        filteredPeaks: FilteredPeak[];
        message?: undefined;
    }>;
    findOneByStockName(stockName: string): Promise<string>;
    update(id: number, updateStockDatumDto: UpdateStockDatumDto): string;
    remove(id: number): string;
}
