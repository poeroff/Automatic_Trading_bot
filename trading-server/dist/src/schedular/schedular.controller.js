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
exports.SchedularController = void 0;
const common_1 = require("@nestjs/common");
const schedular_service_1 = require("./schedular.service");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const SessionService_1 = require("./SessionService");
const microservices_1 = require("@nestjs/microservices");
let SchedularController = class SchedularController {
    constructor(schedularService, configService, sessionService, redisClient) {
        this.schedularService = schedularService;
        this.configService = configService;
        this.sessionService = sessionService;
        this.redisClient = redisClient;
        this.appkey = this.configService.get('appkey');
        this.appsecret = this.configService.get('appsecret');
    }
    createAuthHashKey() {
        const url = 'https://openapi.koreainvestment.com:9443/uapi/hashkey';
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'appkey': this.appkey,
            'appsecret': this.appsecret,
        };
        const data = {
            ORD_PRCS_DVSN_CD: '02',
            CANO: '64858706',
            ACNT_PRDT_CD: '03',
            SLL_BUY_DVSN_CD: '02',
            SHTN_PDNO: '101S06',
            ORD_QTY: '1',
            UNIT_PRICE: '370',
            NMPR_TYPE_CD: '',
            KRX_NMPR_CNDT_CD: '',
            CTAC_TLNO: '',
            FUOP_ITEM_DVSN_CD: '',
            ORD_DVSN_CD: '02',
        };
        this.schedularService.createAuthHashKey(url, headers, data);
    }
    createAccessToken() {
        const url = "https://openapi.koreainvestment.com:9443/oauth2/tokenP";
        const headers = {
            "Content-Type": "application/json; charset=UTF-8"
        };
        const data = {
            "grant_type": "client_credentials",
            "appkey": this.appkey,
            "appsecret": this.appsecret
        };
        this.schedularService.createAccessToken(url, headers, data);
    }
    createWebSocketToken() {
        const url = "https://openapi.koreainvestment.com:9443/oauth2/Approval";
        const headers = {
            "Content-Type": "application/json; charset=UTF-8"
        };
        const data = {
            "grant_type": "client_credentials",
            "appkey": this.appkey,
            "secretkey": this.appsecret
        };
        this.schedularService.createWebSocketToken(url, headers, data);
    }
    async alldayStockData() {
        const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': savedToken,
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHKST03010100',
            "custtype": "P",
            "tr_cont": "M"
        };
        this.schedularService.alldayStockData(url, headers);
    }
    async dayStockData() {
        const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': savedToken,
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHKST03010100',
            "custtype": "P",
            "tr_cont": "M"
        };
        this.schedularService.dayStockData(url, headers);
    }
    async weekStockData() {
        const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': savedToken,
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHKST03010100',
            "custtype": "P",
            "tr_cont": "M"
        };
        this.schedularService.weekStockData(url, headers);
    }
    async stockData() {
        const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        const url = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/industry-price";
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': savedToken,
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'HHDFS76370100',
            "custtype": "P"
        };
        console.log(headers);
        const params = {
            AUTH: '',
            EXCD: "NYS",
        };
        this.schedularService.stockData(url, headers, params);
    }
};
exports.SchedularController = SchedularController;
__decorate([
    (0, schedule_1.Cron)('0 17 21 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "createAuthHashKey", null);
__decorate([
    (0, schedule_1.Cron)('0 57 14 * * *', { timeZone: 'Asia/Seoul' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "createAccessToken", null);
__decorate([
    (0, schedule_1.Cron)('0 55 12 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "createWebSocketToken", null);
__decorate([
    (0, schedule_1.Cron)('30 25 11 * * *', { timeZone: 'Asia/Seoul' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedularController.prototype, "alldayStockData", null);
__decorate([
    (0, schedule_1.Cron)('30 25 11 * * *', { timeZone: 'Asia/Seoul' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedularController.prototype, "dayStockData", null);
__decorate([
    (0, schedule_1.Cron)('0 42 14 * * *', { timeZone: 'Asia/Seoul' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedularController.prototype, "weekStockData", null);
__decorate([
    (0, schedule_1.Cron)('0 30 20 * * *', { timeZone: 'Asia/Seoul' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedularController.prototype, "stockData", null);
exports.SchedularController = SchedularController = __decorate([
    (0, common_1.Controller)('schedular'),
    __param(3, (0, common_1.Inject)("REDIS_CLIENT")),
    __metadata("design:paramtypes", [schedular_service_1.SchedularService, config_1.ConfigService, SessionService_1.SessionService, microservices_1.ClientProxy])
], SchedularController);
//# sourceMappingURL=schedular.controller.js.map