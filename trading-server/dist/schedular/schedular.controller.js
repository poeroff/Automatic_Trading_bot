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
const update_schedular_dto_1 = require("./dto/update-schedular.dto");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const SessionService_1 = require("./SessionService");
let SchedularController = class SchedularController {
    constructor(schedularService, configService, sessionService) {
        this.schedularService = schedularService;
        this.configService = configService;
        this.sessionService = sessionService;
        this.appkey = this.configService.get('appkey');
        this.appsecret = this.configService.get('appsecret');
    }
    CreateAuthHashKey() {
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
        this.schedularService.CreateAuthHashKey(url, headers, data);
    }
    CreateAccessToken() {
        const url = "https://openapi.koreainvestment.com:9443/oauth2/tokenP";
        const headers = {
            "Content-Type": "application/json; charset=UTF-8"
        };
        const data = {
            "grant_type": "client_credentials",
            "appkey": this.appkey,
            "appsecret": this.appsecret
        };
        this.schedularService.CreateAccessToken(url, headers, data);
    }
    CreateWebSocketToken() {
        const url = "https://openapi.koreainvestment.com:9443/oauth2/Approval";
        const headers = {
            "Content-Type": "application/json; charset=UTF-8"
        };
        const data = {
            "grant_type": "client_credentials",
            "appkey": this.appkey,
            "secretkey": this.appsecret
        };
        this.schedularService.CreateWebSocketToken(url, headers, data);
    }
    getWeeklyStockData() {
        const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': this.sessionService.getAccessToken(),
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHKST03010100',
            "custtype": "P"
        };
        const params = {
            FID_COND_MRKT_DIV_CODE: 'J',
            FID_INPUT_ISCD: "005930",
            FID_INPUT_DATE_1: "20220501",
            FID_INPUT_DATE_2: "20250225",
            FID_PERIOD_DIV_CODE: 'W',
            FID_ORG_ADJ_PRC: '0',
        };
        this.schedularService.getWeeklyStockData(url, headers, params);
    }
    findAll() {
        return this.schedularService.findAll();
    }
    findOne(id) {
        return this.schedularService.findOne(+id);
    }
    update(id, updateSchedularDto) {
        return this.schedularService.update(+id, updateSchedularDto);
    }
    remove(id) {
        return this.schedularService.remove(+id);
    }
};
exports.SchedularController = SchedularController;
__decorate([
    (0, schedule_1.Cron)('0 17 21 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "CreateAuthHashKey", null);
__decorate([
    (0, schedule_1.Cron)('0 12 15 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "CreateAccessToken", null);
__decorate([
    (0, schedule_1.Cron)('0 14 21 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "CreateWebSocketToken", null);
__decorate([
    (0, schedule_1.Cron)('10 4 23 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "getWeeklyStockData", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_schedular_dto_1.UpdateSchedularDto]),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedularController.prototype, "remove", null);
exports.SchedularController = SchedularController = __decorate([
    (0, common_1.Controller)('schedular'),
    __metadata("design:paramtypes", [schedular_service_1.SchedularService, config_1.ConfigService, SessionService_1.SessionService])
], SchedularController);
//# sourceMappingURL=schedular.controller.js.map