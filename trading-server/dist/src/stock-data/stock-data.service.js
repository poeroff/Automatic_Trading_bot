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
const PeakDate_entity_1 = require("./entities/PeakDate.entity");
const PeakPrice_entity_1 = require("./entities/PeakPrice.entity");
const filtered_peaks_entity_1 = require("./entities/filtered-peaks.entity");
const user_inflection_entity_1 = require("./entities/user-inflection.entity");
const KoreanStockCode_entity_1 = require("./entities/KoreanStockCode.entity");
let StockDataService = class StockDataService {
    constructor(DayStockDataRepository, KoreanStockCodeRepository, peakDateRepository, peakPriceRepository, filteredPeakRepository, userInflectionRepository) {
        this.DayStockDataRepository = DayStockDataRepository;
        this.KoreanStockCodeRepository = KoreanStockCodeRepository;
        this.peakDateRepository = peakDateRepository;
        this.peakPriceRepository = peakPriceRepository;
        this.filteredPeakRepository = filteredPeakRepository;
        this.userInflectionRepository = userInflectionRepository;
    }
    async getAllCodes() {
        return await this.KoreanStockCodeRepository.find();
    }
    async getStockData(code) {
        const CompanyData = await this.DayStockDataRepository.find({
            where: { trCode: { code: +code } },
            order: { date: 'ASC' },
        });
        if (!CompanyData || CompanyData.length === 0) {
            return { status: 'error', message: `Code ${code} not found in stock_data table` };
        }
        const FormattedData = CompanyData.map(data => ({
            Date: data.date,
            Open: data.open,
            High: data.high,
            Low: data.low,
            Close: data.close,
            Volume: data.volume,
        }));
        return { Data: FormattedData };
    }
    async getUserInflection(code) {
        console.log(code);
        const trCode = await this.KoreanStockCodeRepository.findOne({ where: { code: +code } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        console.log(await this.userInflectionRepository.find({ where: { trCode: { certified: true, id: trCode.id } } }));
        return await this.userInflectionRepository.find({ where: { trCode: { certified: true, id: trCode.id } } });
    }
    async createUserInflectioncode(date, code, highPoint) {
        const trCode = await this.KoreanStockCodeRepository.findOne({ where: { code: +code } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        const dateString = date.toString();
        const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
        const queryDate = new Date(formattedDate);
        queryDate.setHours(0, 0, 0, 0);
    }
    async createUserInflectionname(date, name, highPoint) {
        const trCode = await this.KoreanStockCodeRepository.findOne({ where: { company: name } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        const userInflection = this.userInflectionRepository.create({ trCode: { id: trCode.id }, date: date, highdate: highPoint ?? null });
        return await this.userInflectionRepository.save(userInflection);
    }
    async deleteUserInflection(id) {
        return await this.userInflectionRepository.delete(id);
    }
    async getstockPoint(stock) {
        let Company = null;
        if (typeof stock === "number") {
            Company = await this.KoreanStockCodeRepository.findOne({ where: { code: stock } });
        }
        if (typeof stock === "string") {
            Company = await this.KoreanStockCodeRepository.findOne({ where: { company: stock } });
        }
        if (!Company) {
            throw new common_1.HttpException('Not Found', common_1.HttpStatus.NOT_FOUND);
        }
        console.log(Company);
        const StockData = await this.DayStockDataRepository.find({ where: { trCode: { id: Company.id } } });
        const PeakDates = await this.peakDateRepository.find({ where: { trCode: { id: Company.id } } });
        const FilteredPeaks = await this.filteredPeakRepository.find({ where: { trCode: { id: Company.id } } });
        const UserInflections = await this.userInflectionRepository.find({ where: { trCode: { id: Company.id } } });
        return { Company, StockData, PeakDates, FilteredPeaks, UserInflections };
    }
    async updateCertifiedTrCode(code) {
        const trCode = await this.KoreanStockCodeRepository.findOne({ where: { code: +code } });
        if (!trCode) {
            return { message: 'No stock code or name provided' };
        }
        trCode.certified = true;
        return await this.KoreanStockCodeRepository.save(trCode);
    }
    async getFalseCertified() {
        const uncertifiedTrCodes = await this.KoreanStockCodeRepository.find({ where: { certified: false }, relations: ['peakDates', 'filteredPeaks'] });
        const results = uncertifiedTrCodes.filter(trCode => trCode.peakDates.length > 0);
        return results;
    }
};
exports.StockDataService = StockDataService;
exports.StockDataService = StockDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(DayStockData_entity_1.DayStockData)),
    __param(1, (0, typeorm_1.InjectRepository)(KoreanStockCode_entity_1.KoreanStockCode)),
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