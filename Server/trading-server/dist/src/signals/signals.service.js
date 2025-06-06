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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const KoreanStockCode_entity_1 = require("../stock-data/entities/KoreanStockCode.entity");
const Alert_entity_1 = require("../stock-data/entities/Alert.entity");
const events_gateway_1 = require("../gateway/events.gateway");
const axios_get_1 = require("../../utils/axios_get");
const dayjs_1 = __importDefault(require("dayjs"));
let SignalsService = class SignalsService {
    constructor(AlertRepository, KoreanStockCodeRepository, EventsGateway) {
        this.AlertRepository = AlertRepository;
        this.KoreanStockCodeRepository = KoreanStockCodeRepository;
        this.EventsGateway = EventsGateway;
    }
    async signalscreate(code, price) {
        const stockCode = await this.KoreanStockCodeRepository.findOne({ where: { code } });
        if (!stockCode) {
            throw new common_1.NotFoundException(`Stock with code ${code} not found`);
        }
        const oneMonthAgo = (0, dayjs_1.default)().subtract(31, 'day').toDate();
        const recentAlert = await this.AlertRepository.findOne({
            where: {
                trCode: { id: stockCode.id },
                createdAt: (0, typeorm_2.MoreThan)(oneMonthAgo),
            },
            order: { createdAt: 'DESC' },
        });
        if (recentAlert) {
            throw new common_1.ConflictException(`An alert for code ${code} was already created on ${(0, dayjs_1.default)(recentAlert.createdAt).format('YYYY-MM-DD HH:mm')}, which is within the last 7 days.`);
        }
        const alert = this.AlertRepository.create({
            price: +price,
            trCode: stockCode,
            has_item: true,
        });
        return await this.AlertRepository.save(alert);
    }
    async triggerStockSignal(url, headers) {
        let Trigger = [];
        Trigger = await this.AlertRepository.find({
            where: { has_item: true },
            order: {
                createdAt: 'DESC',
            },
            take: 6,
            relations: ["trCode"]
        });
        for (let i = 0; i < Trigger.length; i++) {
            const params = {
                FID_COND_MRKT_DIV_CODE: 'UN',
                FID_INPUT_ISCD: Trigger[i].trCode.code,
            };
            const response = await (0, axios_get_1.Get)(url, headers, params);
            const output = response.data.output.stck_prpr;
            Trigger[i]['currentPrice'] = output;
        }
        return Trigger;
    }
    triggerStockSignals() {
        return this.AlertRepository.find();
    }
    findOne(id) {
        return `This action returns a #${id} signal`;
    }
    update(id, updateSignalDto) {
        return `This action updates a #${id} signal`;
    }
    remove(id) {
        return `This action removes a #${id} signal`;
    }
};
exports.SignalsService = SignalsService;
exports.SignalsService = SignalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Alert_entity_1.Alert)),
    __param(1, (0, typeorm_1.InjectRepository)(KoreanStockCode_entity_1.KoreanStockCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeorm_2.Repository, events_gateway_1.EventsGateway])
], SignalsService);
//# sourceMappingURL=signals.service.js.map