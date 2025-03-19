import { DayStockData } from "./DayStockData.entity";
import { WeekStockData } from "./WeekStockData.entity";
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
    daystockData: DayStockData[];
    weekstockData: WeekStockData[];
}
