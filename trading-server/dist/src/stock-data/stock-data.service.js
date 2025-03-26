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
const DayStockData_entity_1 = require("./entities/DayStockData.entity");
const tr_code_entity_1 = require("./entities/tr-code.entity");
const PeakDate_entity_1 = require("./entities/PeakDate.entity");
const PeakPrice_entity_1 = require("./entities/PeakPrice.entity");
const filtered_peaks_entity_1 = require("./entities/filtered-peaks.entity");
const user_inflection_entity_1 = require("./entities/user-inflection.entity");
let StockDataService = class StockDataService {
    constructor(stockDataRepository, trCodeRepository, peakDateRepository, peakPriceRepository, filteredPeakRepository, userInflectionRepository) {
        this.stockDataRepository = stockDataRepository;
        this.trCodeRepository = trCodeRepository;
        this.peakDateRepository = peakDateRepository;
        this.peakPriceRepository = peakPriceRepository;
        this.filteredPeakRepository = filteredPeakRepository;
        this.userInflectionRepository = userInflectionRepository;
    }
    create(createStockDatumDto) {
        return 'This action adds a new stockDatum';
    }
    async getAllCodes() {
        return await this.trCodeRepository.find();
    }
    async gettrueCodes() {
        const trCodes = await this.trCodeRepository.find({ where: { certified: true }, relations: ["userInflections"] });
        const results = trCodes.filter(trCode => trCode.userInflections.length > 0);
        return results;
    }
    async getStockData(code) {
        console.log(code);
    }
    async getUserInflection(code) {
        console.log(code);
        const trCode = await this.trCodeRepository.findOne({ where: { code: code } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        console.log(await this.userInflectionRepository.find({ where: { trCode: { certified: true, id: trCode.id } } }));
        return await this.userInflectionRepository.find({ where: { trCode: { certified: true, id: trCode.id } } });
    }
    async createUserInflectioncode(date, code, highPoint) {
        const trCode = await this.trCodeRepository.findOne({ where: { code: code } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        const dateString = date.toString();
        const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
        const queryDate = new Date(formattedDate);
        queryDate.setHours(0, 0, 0, 0);
    }
    async createUserInflectionname(date, name, highPoint) {
        const trCode = await this.trCodeRepository.findOne({ where: { name: name } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        const userInflection = this.userInflectionRepository.create({ trCode: { id: trCode.id }, date: date, highdate: highPoint ?? null });
        return await this.userInflectionRepository.save(userInflection);
    }
    async deleteUserInflection(id) {
        return await this.userInflectionRepository.delete(id);
    }
    async findOneByTrCode(trcode) {
        const trCode = await this.trCodeRepository.findOne({ where: { code: trcode } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
    }
    async findOneByStockName(stockName) {
        const trCode = await this.trCodeRepository.findOne({ where: { name: stockName } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
    }
    async updateCertifiedTrCode(code) {
        const trCode = await this.trCodeRepository.findOne({ where: { code: code } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        trCode.certified = true;
        return await this.trCodeRepository.save(trCode);
    }
    async updateCertifiedStockName(name) {
        const trCode = await this.trCodeRepository.findOne({ where: { name: name } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        trCode.certified = true;
        return await this.trCodeRepository.save(trCode);
    }
    async getFalseCertified() {
        const uncertifiedTrCodes = await this.trCodeRepository.find({ where: { certified: false }, relations: ['peakDates', 'filteredPeaks'] });
        const results = uncertifiedTrCodes.filter(trCode => trCode.peakDates.length > 0 && trCode.filteredPeaks.length > 0);
        return results;
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
    __param(0, (0, typeorm_1.InjectRepository)(DayStockData_entity_1.DayStockData)),
    __param(1, (0, typeorm_1.InjectRepository)(tr_code_entity_1.TrCode)),
    __param(2, (0, typeorm_1.InjectRepository)(PeakDate_entity_1.PeakDate)),
    __param(3, (0, typeorm_1.InjectRepository)(PeakPrice_entity_1.PeakPrice)),
    __param(4, (0, typeorm_1.InjectRepository)(filtered_peaks_entity_1.FilteredPeak)),
    __param(5, (0, typeorm_1.InjectRepository)(user_inflection_entity_1.UserInflection)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StockDataService);
//# sourceMappingURL=stock-data.service.js.map