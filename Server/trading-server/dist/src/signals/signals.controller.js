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
exports.SignalsController = void 0;
const common_1 = require("@nestjs/common");
const signals_service_1 = require("./signals.service");
const update_signal_dto_1 = require("./dto/update-signal.dto");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
let SignalsController = class SignalsController {
    constructor(signalsService, configService, redisClient) {
        this.signalsService = signalsService;
        this.configService = configService;
        this.redisClient = redisClient;
        this.appkey = this.configService.get('appkey');
        this.appsecret = this.configService.get('appsecret');
    }
    signalscreate(body) {
        return this.signalsService.signalscreate(body.code, body.price);
    }
    async triggerStockSignal() {
        const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        const url = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price";
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'authorization': savedToken,
            'appkey': this.appkey,
            'appsecret': this.appsecret,
            'tr_id': 'FHKST01010100',
            "custtype": "P",
            "tr_cont": "M"
        };
        console.log(headers);
        return this.signalsService.triggerStockSignal(url, headers);
    }
    triggerStockSignals() {
        return this.signalsService.triggerStockSignals();
    }
    findOne(id) {
        return this.signalsService.findOne(+id);
    }
    update(id, updateSignalDto) {
        return this.signalsService.update(+id, updateSignalDto);
    }
    remove(id) {
        return this.signalsService.remove(+id);
    }
};
exports.SignalsController = SignalsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SignalsController.prototype, "signalscreate", null);
__decorate([
    (0, common_1.Get)("/trigger"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SignalsController.prototype, "triggerStockSignal", null);
__decorate([
    (0, common_1.Post)("triggers"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SignalsController.prototype, "triggerStockSignals", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SignalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_signal_dto_1.UpdateSignalDto]),
    __metadata("design:returntype", void 0)
], SignalsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SignalsController.prototype, "remove", null);
exports.SignalsController = SignalsController = __decorate([
    (0, common_1.Controller)('signals'),
    __param(2, (0, common_1.Inject)("REDIS_CLIENT")),
    __metadata("design:paramtypes", [signals_service_1.SignalsService, config_1.ConfigService, microservices_1.ClientProxy])
], SignalsController);
//# sourceMappingURL=signals.controller.js.map