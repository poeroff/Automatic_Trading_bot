import { KoreanStockCode } from './KoreanStockCode.entity';
export declare class Alert {
    id: number;
    price: number;
    has_item: boolean;
    createdAt: Date;
    trCode: KoreanStockCode;
    setCreatedAt(): void;
}
