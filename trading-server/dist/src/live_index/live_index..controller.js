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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveIndexController = void 0;
const common_1 = require("@nestjs/common");
const live_index_service_1 = require("./live_index.service");
const config_1 = require("@nestjs/config");
const SessionService_1 = require("../schedular/SessionService");
let LiveIndexController = class LiveIndexController {
    constructor(liveindexservice, configService, sessionService) {
        this.liveindexservice = liveindexservice;
        this.configService = configService;
        this.sessionService = sessionService;
        this.appkey = this.configService.get('appkey');
        this.appsecret = this.configService.get('appsecret');
    }
    Kospiindex() {
        const url = "https://openapi.koreainvestment.com:9443//uapi/domestic-stock/v1/quotations/inquire-index-price";
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': this.sessionService.getAccessToken(),
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHPUP02100000',
            "custtype": "P"
        };
        const params = {
            FID_COND_MRKT_DIV_CODE: 'U',
            FID_INPUT_ISCD: "0001",
        };
    }
};
exports.LiveIndexController = LiveIndexController;
__decorate([
    (0, common_1.Get)("kospi"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LiveIndexController.prototype, "Kospiindex", null);
exports.LiveIndexController = LiveIndexController = __decorate([
    (0, common_1.Controller)("liveindex"),
    __metadata("design:paramtypes", [live_index_service_1.LiveIndexService, config_1.ConfigService, SessionService_1.SessionService])
], LiveIndexController);
//# sourceMappingURL=live_index..controller.js.map