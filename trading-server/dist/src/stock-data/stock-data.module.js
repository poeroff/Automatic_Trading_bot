"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockDataModule = void 0;
const common_1 = require("@nestjs/common");
const stock_data_service_1 = require("./stock-data.service");
const stock_data_controller_1 = require("./stock-data.controller");
const typeorm_1 = require("@nestjs/typeorm");
const DayStockData_entity_1 = require("./entities/DayStockData.entity");
const PeakDate_entity_1 = require("./entities/PeakDate.entity");
const PeakPrice_entity_1 = require("./entities/PeakPrice.entity");
const filtered_peaks_entity_1 = require("./entities/filtered-peaks.entity");
const user_inflection_entity_1 = require("./entities/user-inflection.entity");
const KoreanStockCode_entity_1 = require("./entities/KoreanStockCode.entity");
const WeekStockData_entity_1 = require("./entities/WeekStockData.entity");
let StockDataModule = class StockDataModule {
};
exports.StockDataModule = StockDataModule;
exports.StockDataModule = StockDataModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([DayStockData_entity_1.DayStockData, PeakDate_entity_1.PeakDate, PeakPrice_entity_1.PeakPrice, filtered_peaks_entity_1.FilteredPeak, user_inflection_entity_1.UserInflection, KoreanStockCode_entity_1.KoreanStockCode, WeekStockData_entity_1.WeekStockData])],
        controllers: [stock_data_controller_1.StockDataController],
        providers: [stock_data_service_1.StockDataService],
    })
], StockDataModule);
//# sourceMappingURL=stock-data.module.js.map