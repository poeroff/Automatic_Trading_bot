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
exports.DayStockData = void 0;
const typeorm_1 = require("typeorm");
const KoreanStockCode_entity_1 = require("./KoreanStockCode.entity");
let DayStockData = class DayStockData {
};
exports.DayStockData = DayStockData;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DayStockData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => KoreanStockCode_entity_1.KoreanStockCode, (code) => code.daystockData, { eager: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'stock_id' }),
    __metadata("design:type", KoreanStockCode_entity_1.KoreanStockCode)
], DayStockData.prototype, "trCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], DayStockData.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], DayStockData.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], DayStockData.prototype, "high", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], DayStockData.prototype, "low", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], DayStockData.prototype, "close", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], DayStockData.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DayStockData.prototype, "prdy_vrss_sign", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DayStockData.prototype, "prdy_vrss", void 0);
exports.DayStockData = DayStockData = __decorate([
    (0, typeorm_1.Entity)('DayStockData')
], DayStockData);
//# sourceMappingURL=DayStockData.entity.js.map