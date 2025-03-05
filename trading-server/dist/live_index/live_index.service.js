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
exports.LiveIndexService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const SessionService_1 = require("../schedular/SessionService");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
let LiveIndexService = class LiveIndexService {
    constructor(sessionService, configService, redisClient) {
        this.sessionService = sessionService;
        this.configService = configService;
        this.redisClient = redisClient;
        this.appkey = this.configService.get('appkey');
        this.appsecret = this.configService.get('appsecret');
    }
    async KospiIndex() {
        const url = "https://openapi.koreainvestment.com:9443//uapi/domestic-stock/v1/quotations/inquire-index-price";
        const getAccessToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': getAccessToken,
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHPUP02100000',
            "custtype": "P"
        };
        const params = {
            FID_COND_MRKT_DIV_CODE: 'U',
            FID_INPUT_ISCD: "0001",
        };
        try {
            const response = await axios_1.default.get(url, { headers: headers, params: params });
            return response.data.output;
        }
        catch (error) {
            throw new Error('주봉 데이터 조회 실패');
        }
    }
    findAll() {
        return `This action returns all liveIndex`;
    }
    findOne(id) {
        return `This action returns a #${id} liveIndex`;
    }
    update(id, updateLiveIndexDto) {
        return `This action updates a #${id} liveIndex`;
    }
    remove(id) {
        return `This action removes a #${id} liveIndex`;
    }
};
exports.LiveIndexService = LiveIndexService;
exports.LiveIndexService = LiveIndexService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)("REDIS_CLIENT")),
    __metadata("design:paramtypes", [SessionService_1.SessionService, config_1.ConfigService, microservices_1.ClientProxy])
], LiveIndexService);
//# sourceMappingURL=live_index.service.js.map