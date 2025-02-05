import { TrCode } from './tr-code.entity';
export declare class StockData {
    id: number;
    trCode: TrCode;
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    avg_daily_volume: number;
}
