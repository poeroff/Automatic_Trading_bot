import { TrCode } from './tr-code.entity';
export declare class StockData {
    id: number;
    trCode: TrCode;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
