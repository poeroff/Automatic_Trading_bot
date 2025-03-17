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
exports.KoreanStockCode = void 0;
const typeorm_1 = require("typeorm");
const DayStockData_entity_1 = require("./DayStockData.entity");
const WeekStockData_entity_1 = require("./WeekStockData.entity");
let KoreanStockCode = class KoreanStockCode {
};
exports.KoreanStockCode = KoreanStockCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], KoreanStockCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KoreanStockCode.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], KoreanStockCode.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KoreanStockCode.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KoreanStockCode.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KoreanStockCode.prototype, "listed_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KoreanStockCode.prototype, "settlement_month", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KoreanStockCode.prototype, "representative", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KoreanStockCode.prototype, "homepage", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DayStockData_entity_1.DayStockData, (daystockData) => daystockData.trCode),
    __metadata("design:type", Array)
], KoreanStockCode.prototype, "daystockData", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WeekStockData_entity_1.WeekStockData, (weekstockData) => weekstockData.trCode),
    __metadata("design:type", Array)
], KoreanStockCode.prototype, "weekstockData", void 0);
exports.KoreanStockCode = KoreanStockCode = __decorate([
    (0, typeorm_1.Entity)('KoreanStockCode')
], KoreanStockCode);
//# sourceMappingURL=KoreanStockCode.entity.js.map