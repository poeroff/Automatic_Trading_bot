import { DayStockData } from "./DayStockData.entity";
import { WeekStockData } from "./WeekStockData.entity";
import { PeakDate } from "./PeakDate.entity";
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
    daystockData: DayStockData[];
    weekstockData: WeekStockData[];
    peakDates: PeakDate[];
}
