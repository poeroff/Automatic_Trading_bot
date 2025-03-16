import { StockData } from "./stock-data.entity";
export declare class Kospi {
    id: bigint;
    company: string;
    code: number;
    category: string;
    products: string;
    listed_date: string;
    settlement_month: string;
    representative: string;
    homepage: string;
    stockData: StockData[];
}
