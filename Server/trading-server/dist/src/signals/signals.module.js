"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalsModule = void 0;
const common_1 = require("@nestjs/common");
const signals_service_1 = require("./signals.service");
const signals_controller_1 = require("./signals.controller");
const typeorm_1 = require("@nestjs/typeorm");
const Alert_entity_1 = require("../stock-data/entities/Alert.entity");
const KoreanStockCode_entity_1 = require("../stock-data/entities/KoreanStockCode.entity");
const events_gateway_1 = require("../gateway/events.gateway");
const live_index_module_1 = require("../live_index/live_index.module");
const redis_module_1 = require("../redis/redis.module");
let SignalsModule = class SignalsModule {
};
exports.SignalsModule = SignalsModule;
exports.SignalsModule = SignalsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([Alert_entity_1.Alert, KoreanStockCode_entity_1.KoreanStockCode]), live_index_module_1.LiveIndexModule, redis_module_1.RedisModule],
        controllers: [signals_controller_1.SignalsController],
        providers: [signals_service_1.SignalsService, events_gateway_1.EventsGateway],
    })
], SignalsModule);
//# sourceMappingURL=signals.module.js.map