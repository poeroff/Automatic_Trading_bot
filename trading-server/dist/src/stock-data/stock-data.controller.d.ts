import { StockDataService } from './stock-data.service';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
export declare class StockDataController {
    private readonly stockDataService;
    constructor(stockDataService: StockDataService);
    create(createStockDatumDto: CreateStockDatumDto): string;
    getAllCodes(): Promise<import("./entities/tr-code.entity").TrCode[]>;
    gettrueCodes(): Promise<import("./entities/tr-code.entity").TrCode[]>;
    getStockData(body: {
        code: string;
    }): Promise<void>;
    getUserInflection(body: {
        code: string;
    }): Promise<import("./entities/user-inflection.entity").UserInflection[] | {
        message: string;
    }>;
    createUserInflection(body: {
        date: number;
        highPoint?: number | null;
        code?: string;
        name?: string;
    }): Promise<{
        message: string;
    } | undefined> | Promise<import("./entities/user-inflection.entity").UserInflection | {
        message: string;
    }> | undefined;
    deleteUserInflection(body: {
        id: number;
    }): Promise<import("typeorm").DeleteResult>;
    findOne(code?: string, name?: string): Promise<{
        message: string;
    } | undefined> | {
        message: string;
    };
    updateCertified(code?: string, name?: string): Promise<import("./entities/tr-code.entity").TrCode | {
        message: string;
    }> | undefined;
    getFalseCertified(): Promise<import("./entities/tr-code.entity").TrCode[]>;
    update(id: string, updateStockDatumDto: UpdateStockDatumDto): string;
    remove(id: string): string;
}
