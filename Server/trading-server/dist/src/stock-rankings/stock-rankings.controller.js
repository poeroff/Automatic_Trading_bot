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
exports.StockRankingsController = void 0;
const common_1 = require("@nestjs/common");
const stock_rankings_service_1 = require("./stock-rankings.service");
const update_stock_ranking_dto_1 = require("./dto/update-stock-ranking.dto");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
let StockRankingsController = class StockRankingsController {
    constructor(stockRankingsService, configService, redisClient) {
        this.stockRankingsService = stockRankingsService;
        this.configService = configService;
        this.redisClient = redisClient;
        this.appkey = this.configService.get('appkey');
        this.appsecret = this.configService.get('appsecret');
    }
    async tradingvolume() {
        const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/volume-rank";
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': savedToken,
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHPST01710000',
            "custtype": "P",
        };
        const params = {
            FID_COND_MRKT_DIV_CODE: 'J',
            FID_COND_SCR_DIV_CODE: "20171",
            FID_INPUT_ISCD: "0000",
            FID_DIV_CLS_CODE: "0",
            FID_BLNG_CLS_CODE: "0",
            FID_TRGT_CLS_CODE: '111111111',
            FID_TRGT_EXLS_CLS_CODE: '0000000000',
            FID_INPUT_PRICE_1: "",
            FID_INPUT_PRICE_2: "",
            FID_VOL_CNT: "",
            FID_INPUT_DATE_1: "",
        };
        return this.stockRankingsService.tradingvolume(url, headers, params);
    }
    findAll() {
        return this.stockRankingsService.findAll();
    }
    findOne(id) {
        return this.stockRankingsService.findOne(+id);
    }
    update(id, updateStockRankingDto) {
        return this.stockRankingsService.update(+id, updateStockRankingDto);
    }
    remove(id) {
        return this.stockRankingsService.remove(+id);
    }
};
exports.StockRankingsController = StockRankingsController;
__decorate([
    (0, common_1.Get)("/tradingvolume"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockRankingsController.prototype, "tradingvolume", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockRankingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockRankingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_stock_ranking_dto_1.UpdateStockRankingDto]),
    __metadata("design:returntype", void 0)
], StockRankingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockRankingsController.prototype, "remove", null);
exports.StockRankingsController = StockRankingsController = __decorate([
    (0, common_1.Controller)('stock-rankings'),
    __param(2, (0, common_1.Inject)("REDIS_CLIENT")),
    __metadata("design:paramtypes", [stock_rankings_service_1.StockRankingsService, config_1.ConfigService, microservices_1.ClientProxy])
], StockRankingsController);
//# sourceMappingURL=stock-rankings.controller.js.map