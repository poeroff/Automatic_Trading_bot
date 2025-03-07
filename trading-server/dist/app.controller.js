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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const ioredis_1 = require("ioredis");
let AppController = class AppController {
    constructor() {
        this.redisClient = new ioredis_1.default({
            host: 'localhost',
            port: 6379,
        });
    }
    async handleSetKey(data) {
        if (data.ttl && data.ttl > 0) {
            await this.redisClient.setex(data.key, data.ttl, data.value);
        }
        else {
            await this.redisClient.set(data.key, data.value);
        }
    }
    async handleGetKey(key) {
        const value = await this.redisClient.get(key);
        return value;
    }
};
exports.AppController = AppController;
__decorate([
    (0, microservices_1.EventPattern)('set_key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleSetKey", null);
__decorate([
    (0, microservices_1.MessagePattern)('get_key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleGetKey", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map