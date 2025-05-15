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
let LiveIndexController = class LiveIndexController {
    constructor(liveindexservice, configService) {
        this.liveindexservice = liveindexservice;
        this.configService = configService;
        this.appkey = this.configService.get('appkey');
        this.appsecret = this.configService.get('appsecret');
    }
    Kospiindex() {
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
    __metadata("design:paramtypes", [live_index_service_1.LiveIndexService, config_1.ConfigService])
], LiveIndexController);
//# sourceMappingURL=live_index..controller.js.map