"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceluploadModule = void 0;
const common_1 = require("@nestjs/common");
const excelupload_service_1 = require("./excelupload.service");
const excelupload_controller_1 = require("./excelupload.controller");
const typeorm_1 = require("@nestjs/typeorm");
const KoreanStockCode_entity_1 = require("../stock-data/entities/KoreanStockCode.entity");
const redis_module_1 = require("../redis/redis.module");
const DayStockData_entity_1 = require("../stock-data/entities/DayStockData.entity");
const WeekStockData_entity_1 = require("../stock-data/entities/WeekStockData.entity");
const MonthStockData_entity_1 = require("../stock-data/entities/MonthStockData.entity");
let ExceluploadModule = class ExceluploadModule {
};
exports.ExceluploadModule = ExceluploadModule;
exports.ExceluploadModule = ExceluploadModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([KoreanStockCode_entity_1.KoreanStockCode, DayStockData_entity_1.DayStockData, WeekStockData_entity_1.WeekStockData, MonthStockData_entity_1.MonthStockData]), redis_module_1.RedisModule],
        controllers: [excelupload_controller_1.ExceluploadController],
        providers: [excelupload_service_1.ExceluploadService],
    })
], ExceluploadModule);
//# sourceMappingURL=excelupload.module.js.map