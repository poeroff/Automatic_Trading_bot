import { KoreanStockCode } from './KoreanStockCode.entity';
export declare class Alert {
    id: number;
    price: number;
    createdAt: Date;
    trCode: KoreanStockCode;
    setCreatedAt(): void;
}
