import { UpdateStockRankingDto } from './dto/update-stock-ranking.dto';
export declare class StockRankingsService {
    tradingvolume(url: any, headers: any, params: any): Promise<any>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateStockRankingDto: UpdateStockRankingDto): string;
    remove(id: number): string;
}
