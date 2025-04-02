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
exports.SchedularService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const dayjs_1 = __importDefault(require("dayjs"));
const SessionService_1 = require("./SessionService");
const microservices_1 = require("@nestjs/microservices");
const typeorm_1 = require("@nestjs/typeorm");
const KoreanStockCode_entity_1 = require("../stock-data/entities/KoreanStockCode.entity");
const typeorm_2 = require("typeorm");
const sleep_1 = require("../../utils/sleep");
const DayStockData_entity_1 = require("../stock-data/entities/DayStockData.entity");
const WeekStockData_entity_1 = require("../stock-data/entities/WeekStockData.entity");
let SchedularService = class SchedularService {
    constructor(koreastockcodeRepository, daystockdataRepository, weekstockdataRepository, sessionService, redisClient) {
        this.koreastockcodeRepository = koreastockcodeRepository;
        this.daystockdataRepository = daystockdataRepository;
        this.weekstockdataRepository = weekstockdataRepository;
        this.sessionService = sessionService;
        this.redisClient = redisClient;
        this.today = new Date();
        this.year = this.today.getFullYear().toString();
        this.month = (this.today.getMonth() + 1).toString().padStart(2, '0');
        this.day = this.today.getDate().toString().padStart(2, '0');
        this.todayStr = `${this.year}${this.month}${this.day}`;
    }
    async createAuthHashKey(url, headers, data) {
        try {
            const response = await axios_1.default.post(url, data, { headers: headers });
            this.sessionService.setHashKey(response.data.HASH);
        }
        catch (error) {
            throw new Error('API request failed');
        }
    }
    async createAccessToken(url, headers, data) {
        try {
            const response = await axios_1.default.post(url, data, { headers: headers });
            const accessToken = response.data.token_type + " " + response.data.access_token;
            this.redisClient.emit('set_key', { key: "AccessToken", value: accessToken, ttl: 86400 });
            setTimeout(async () => {
                const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
                console.log(`✅ Retrieved from Redis: ${savedToken}`);
            }, 1000);
            this.sessionService.setAccessToken(accessToken);
        }
        catch (error) {
            console.error('❌ API request failed:', error.message);
            throw new Error('API request failed');
        }
    }
    async createWebSocketToken(url, headers, data) {
        try {
            const response = await axios_1.default.post(url, data, { headers: headers });
            this.sessionService.setWebSocketToken(response.data.approval_key);
        }
        catch (error) {
            throw new Error('API request failed');
        }
    }
    async dayStockData(url, headers) {
        const codeList = await this.koreastockcodeRepository.find();
        for (let i = 0; i < codeList.length; i++) {
            const code = codeList[i];
            const originalDate = code.listed_date;
            const codeStr = code.code.toString().padStart(6, '0');
            const startDay = (0, dayjs_1.default)(originalDate, 'YYYY-MM-DD');
            const endDay = (0, dayjs_1.default)(this.todayStr, 'YYYYMMDD').subtract(1, 'day');
            const chunkSize = 100;
            let currentStart = startDay;
            while (currentStart.isBefore(endDay)) {
                let currentEnd = currentStart.add(chunkSize - 1, 'day');
                if (currentEnd.isAfter(endDay)) {
                    currentEnd = endDay;
                }
                const params = {
                    FID_COND_MRKT_DIV_CODE: 'J',
                    FID_INPUT_ISCD: codeStr,
                    FID_INPUT_DATE_1: currentStart.format('YYYYMMDD'),
                    FID_INPUT_DATE_2: currentEnd.format('YYYYMMDD'),
                    FID_PERIOD_DIV_CODE: 'D',
                    FID_ORG_ADJ_PRC: '0',
                };
                await (0, sleep_1.sleep)(500);
                try {
                    const response = await axios_1.default.get(url, { headers, params });
                    const data = response.data;
                    const output2 = data.output2;
                    for (const stockdata of output2) {
                        const stock = await this.daystockdataRepository.findOne({ where: { date: stockdata.stck_bsop_date, trCode: { id: Number(code.id) } } });
                        if (!stock) {
                            await this.daystockdataRepository.save({ date: stockdata.stck_bsop_date, open: Number(stockdata.stck_oprc), high: Number(stockdata.stck_hgpr), low: Number(stockdata.stck_lwpr), close: Number(stockdata.stck_clpr), volume: Number(stockdata.acml_vol), trCode: { id: Number(code.id) } });
                        }
                    }
                }
                catch (error) {
                    console.error('API 호출 에러:', error.message);
                }
                currentStart = currentEnd.add(1, 'day');
            }
        }
    }
    async weekStockData(url, headers) {
        let count = 0;
        const codeList = await this.koreastockcodeRepository.find();
        for (let i = 500; i < codeList.length; i++) {
            const code = codeList[i];
            const originalDate = code.listed_date;
            const codeStr = code.code.toString().padStart(6, '0');
            const startDay = (0, dayjs_1.default)(originalDate, 'YYYY-MM-DD');
            const endDay = (0, dayjs_1.default)(this.todayStr, 'YYYYMMDD');
            const chunkSize = 100;
            let currentStart = startDay;
            while (currentStart.isBefore(endDay)) {
                let currentEnd = currentStart.add(chunkSize - 1, 'day');
                if (currentEnd.isAfter(endDay)) {
                    currentEnd = endDay;
                }
                const params = {
                    FID_COND_MRKT_DIV_CODE: 'J',
                    FID_INPUT_ISCD: codeStr,
                    FID_INPUT_DATE_1: currentStart.format('YYYYMMDD'),
                    FID_INPUT_DATE_2: currentEnd.format('YYYYMMDD'),
                    FID_PERIOD_DIV_CODE: 'W',
                    FID_ORG_ADJ_PRC: '0',
                };
                await (0, sleep_1.sleep)(500);
                try {
                    const response = await axios_1.default.get(url, { headers, params });
                    const data = response.data;
                    const output2 = data.output2;
                    for (const stockdata of output2) {
                        const stock = await this.weekstockdataRepository.findOne({ where: { date: stockdata.stck_bsop_date, trCode: { id: Number(code.id) } } });
                        if (!stock) {
                            await this.weekstockdataRepository.save({ date: stockdata.stck_bsop_date, open: Number(stockdata.stck_oprc), high: Number(stockdata.stck_hgpr), low: Number(stockdata.stck_lwpr), close: Number(stockdata.stck_clpr), volume: Number(stockdata.acml_vol), trCode: { id: Number(code.id) } });
                        }
                    }
                }
                catch (error) {
                    console.error('API 호출 에러:', error.message);
                }
                currentStart = currentEnd.add(1, 'day');
            }
            count++;
            if (count === 1) {
                break;
            }
        }
    }
    async stockData(url, headers, data) {
        try {
            const response = await axios_1.default.post(url, data, { headers: headers });
            return response.data;
        }
        catch (error) {
            throw new Error('주봉 데이터 조회 실패');
        }
    }
};
exports.SchedularService = SchedularService;
exports.SchedularService = SchedularService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(KoreanStockCode_entity_1.KoreanStockCode)),
    __param(1, (0, typeorm_1.InjectRepository)(DayStockData_entity_1.DayStockData)),
    __param(2, (0, typeorm_1.InjectRepository)(WeekStockData_entity_1.WeekStockData)),
    __param(4, (0, common_1.Inject)("REDIS_CLIENT")),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        SessionService_1.SessionService,
        microservices_1.ClientProxy])
], SchedularService);
//# sourceMappingURL=schedular.service.js.map