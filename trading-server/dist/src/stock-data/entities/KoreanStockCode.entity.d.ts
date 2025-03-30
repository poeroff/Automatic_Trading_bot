import { DayStockData } from "./DayStockData.entity";
import { WeekStockData } from "./WeekStockData.entity";
import { PeakDate } from "./PeakDate.entity";
import { FilteredPeak } from "./FilterPeak.entity";
import { UserInflection } from "./user-inflection.entity";
import { PeakPrice } from "./PeakPrice.entity";
export declare class KoreanStockCode {
    id: number;
    company: string;
    code: number;
    category: string;
    products: string;
    listed_date: string;
    settlement_month: string;
    representative: string;
    homepage: string;
    region: string;
    certified: boolean;
    daystockData: DayStockData[];
    weekstockData: WeekStockData[];
    peakDates: PeakDate[];
    filteredPeaks: FilteredPeak[];
    userInflections: UserInflection[];
    peakPrices: PeakPrice[];
}
