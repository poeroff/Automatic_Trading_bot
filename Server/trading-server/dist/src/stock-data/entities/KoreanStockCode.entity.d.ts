import { DayStockData } from "./DayStockData.entity";
import { PeakDate } from "./PeakDate.entity";
import { FilteredPeak } from "./FilterPeak.entity";
import { UserInflection } from "./UserInflection.entity";
import { PeakPrice } from "./PeakPrice.entity";
import { Alert } from "./Alert.entity";
import { StockFilter } from "./StockFilter";
export declare class KoreanStockCode {
    id: number;
    company: string;
    code: string;
    category: string;
    products: string;
    listed_date: string;
    settlement_month: string;
    representative: string;
    homepage: string;
    region: string;
    mket_id_cd: string;
    stockFilter: StockFilter;
    daystockData: DayStockData[];
    peakDates: PeakDate[];
    filteredPeaks: FilteredPeak[];
    userInflections: UserInflection[];
    peakPrices: PeakPrice[];
    alert: Alert[];
}
