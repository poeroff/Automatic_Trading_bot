import { StockData } from './stock-datum.entity';
import { PeakDate } from './peak-dates.entity';
import { PeakPrice } from './PeakPrice.entity';
import { FilteredPeak } from './filtered-peaks.entity';
import { UserInflection } from './user-inflection.entity';
export declare class TrCode {
    id: number;
    code: string;
    name: string;
    current_inflection_count: number;
    previous_inflection_count: number;
    previous_peak_count: number;
    current_peak_count: number;
    stockData: StockData[];
    peakDates: PeakDate[];
    peakPrices: PeakPrice[];
    filteredPeaks: FilteredPeak[];
    userInflections: UserInflection[];
}
