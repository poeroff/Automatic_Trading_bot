import { KoreanStockCode } from './KoreanStockCode.entity';
export declare class DayStockData {
    id: number;
    trCode: KoreanStockCode;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
