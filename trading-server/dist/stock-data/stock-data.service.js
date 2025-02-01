"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockDataService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_datum_entity_1 = require("./entities/stock-datum.entity");
const tr_code_entity_1 = require("./entities/tr-code.entity");
const peak_dates_entity_1 = require("./entities/peak-dates.entity");
const PeakPrice_entity_1 = require("./entities/PeakPrice.entity");
const filtered_peaks_entity_1 = require("./entities/filtered-peaks.entity");
let StockDataService = class StockDataService {
    constructor(stockDataRepository, trCodeRepository, peakDateRepository, peakPriceRepository, filteredPeakRepository) {
        this.stockDataRepository = stockDataRepository;
        this.trCodeRepository = trCodeRepository;
        this.peakDateRepository = peakDateRepository;
        this.peakPriceRepository = peakPriceRepository;
        this.filteredPeakRepository = filteredPeakRepository;
    }
    create(createStockDatumDto) {
        return 'This action adds a new stockDatum';
    }
    findAll() {
        return `This action returns all stockData`;
    }
    async findOneByTrCode(trcode) {
        console.log(trcode);
        const trCode = await this.trCodeRepository.findOne({ where: { code: trcode } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        const stockData = await this.stockDataRepository.find({ where: { trCode: { id: trCode.id } } });
        const peakDates = await this.peakDateRepository.find({ where: { trCode: { id: trCode.id } } });
        const peakPrices = await this.peakPriceRepository.find({ where: { trCode: { id: trCode.id } } });
        const filteredPeaks = await this.filteredPeakRepository.find({ where: { trCode: { id: trCode.id } } });
        return { trCode, stockData, peakDates, peakPrices, filteredPeaks };
    }
    async findOneByStockName(stockName) {
        return `This action returns a #${stockName} stockDatum`;
    }
    update(id, updateStockDatumDto) {
        return `This action updates a #${id} stockDatum`;
    }
    remove(id) {
        return `This action removes a #${id} stockDatum`;
    }
};
exports.StockDataService = StockDataService;
exports.StockDataService = StockDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_datum_entity_1.StockData)),
    __param(1, (0, typeorm_1.InjectRepository)(tr_code_entity_1.TrCode)),
    __param(2, (0, typeorm_1.InjectRepository)(peak_dates_entity_1.PeakDate)),
    __param(3, (0, typeorm_1.InjectRepository)(PeakPrice_entity_1.PeakPrice)),
    __param(4, (0, typeorm_1.InjectRepository)(filtered_peaks_entity_1.FilteredPeak)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeorm_2.Repository, typeorm_2.Repository, typeorm_2.Repository, typeorm_2.Repository])
], StockDataService);
//# sourceMappingURL=stock-data.service.js.map