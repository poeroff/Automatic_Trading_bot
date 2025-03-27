"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedularModule = void 0;
const common_1 = require("@nestjs/common");
const schedular_service_1 = require("./schedular.service");
const schedular_controller_1 = require("./schedular.controller");
const schedule_1 = require("@nestjs/schedule");
const SessionService_1 = require("./SessionService");
const typeorm_1 = require("@nestjs/typeorm");
const DayStockData_entity_1 = require("../stock-data/entities/DayStockData.entity");
const redis_module_1 = require("../redis/redis.module");
const KoreanStockCode_entity_1 = require("../stock-data/entities/KoreanStockCode.entity");
const WeekStockData_entity_1 = require("../stock-data/entities/WeekStockData.entity");
let SchedularModule = class SchedularModule {
};
exports.SchedularModule = SchedularModule;
exports.SchedularModule = SchedularModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), typeorm_1.TypeOrmModule.forFeature([DayStockData_entity_1.DayStockData, KoreanStockCode_entity_1.KoreanStockCode, WeekStockData_entity_1.WeekStockData]), redis_module_1.RedisModule],
        controllers: [schedular_controller_1.SchedularController],
        providers: [schedular_service_1.SchedularService, SessionService_1.SessionService],
        exports: [SessionService_1.SessionService]
    })
], SchedularModule);
//# sourceMappingURL=schedular.module.js.map