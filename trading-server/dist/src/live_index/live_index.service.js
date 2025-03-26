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
exports.LiveIndexService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
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
        this.getCurrentDate = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };
    }
    async Korea_main_stock_marketIndex() {
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
        const kospi_response_params = {
            FID_COND_MRKT_DIV_CODE: 'U',
            FID_INPUT_ISCD: "0001",
        };
        const kosdak_response_params = {
            FID_COND_MRKT_DIV_CODE: 'U',
            FID_INPUT_ISCD: "1001",
        };
        const kospi200_response_params = {
            FID_COND_MRKT_DIV_CODE: 'U',
            FID_INPUT_ISCD: "2001",
        };
        const exchange_rate_url = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice";
        const exchange_rate_headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': getAccessToken,
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHKST03030100',
            "custtype": "P"
        };
        const exchange_rate_USD_params = {
            FID_COND_MRKT_DIV_CODE: 'N',
            FID_INPUT_ISCD: "FX@KRWKFTC",
            FID_INPUT_DATE_1: this.getCurrentDate(),
            FID_INPUT_DATE_2: this.getCurrentDate(),
            FID_PERIOD_DIV_CODE: "D"
        };
        const exchange_rate_JPY_params = {
            FID_COND_MRKT_DIV_CODE: 'N',
            FID_INPUT_ISCD: "FX@KRWJS",
            FID_INPUT_DATE_1: this.getCurrentDate(),
            FID_INPUT_DATE_2: this.getCurrentDate(),
            FID_PERIOD_DIV_CODE: "D"
        };
        try {
            const [kospi_response, kosdak_response, kospi200_response, exchange_rate_USD_response, exchange_rate_JPY_response] = await Promise.all([
                axios_1.default.get(url, { headers: headers, params: kospi_response_params }),
                axios_1.default.get(url, { headers: headers, params: kosdak_response_params }),
                axios_1.default.get(url, { headers: headers, params: kospi200_response_params }),
                axios_1.default.get(exchange_rate_url, { headers: exchange_rate_headers, params: exchange_rate_USD_params }),
                axios_1.default.get(exchange_rate_url, { headers: exchange_rate_headers, params: exchange_rate_JPY_params })
            ]);
            return {
                kospi: { bstp_nmix_prpr: kospi_response.data.output.bstp_nmix_prpr, bstp_nmix_prdy_vrss: kospi_response.data.output.bstp_nmix_prdy_vrss, bstp_nmix_prdy_ctrt: kospi_response.data.output.bstp_nmix_prdy_ctrt, },
                kosdak: { bstp_nmix_prpr: kosdak_response.data.output.bstp_nmix_prpr, bstp_nmix_prdy_vrss: kosdak_response.data.output.bstp_nmix_prdy_vrss, bstp_nmix_prdy_ctrt: kosdak_response.data.output.bstp_nmix_prdy_ctrt, },
                kospi200: { bstp_nmix_prpr: kospi200_response.data.output.bstp_nmix_prpr, bstp_nmix_prdy_vrss: kospi200_response.data.output.bstp_nmix_prdy_vrss, bstp_nmix_prdy_ctrt: kospi200_response.data.output.bstp_nmix_prdy_ctrt, },
                exchange_rate_USD: { ovrs_nmix_prpr: exchange_rate_USD_response.data.output1.ovrs_nmix_prpr, ovrs_nmix_prdy_vrss: exchange_rate_USD_response.data.output1.ovrs_nmix_prdy_vrss, prdy_ctrt: exchange_rate_USD_response.data.output1.prdy_ctrt },
                exchange_rate_JPY: { ovrs_nmix_prpr: exchange_rate_JPY_response.data.output1.ovrs_nmix_prpr, ovrs_nmix_prdy_vrss: exchange_rate_JPY_response.data.output1.ovrs_nmix_prdy_vrss, prdy_ctrt: exchange_rate_JPY_response.data.output1.prdy_ctrt },
            };
        }
        catch (error) {
            throw new Error('지수 데이터 조회 실패');
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