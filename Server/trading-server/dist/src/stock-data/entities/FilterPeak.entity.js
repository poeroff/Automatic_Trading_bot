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
exports.FilteredPeak = void 0;
const typeorm_1 = require("typeorm");
const KoreanStockCode_entity_1 = require("./KoreanStockCode.entity");
let FilteredPeak = class FilteredPeak {
};
exports.FilteredPeak = FilteredPeak;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FilteredPeak.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => KoreanStockCode_entity_1.KoreanStockCode, (KoreanStockCode) => KoreanStockCode.filteredPeaks, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'stock_id' }),
    __metadata("design:type", KoreanStockCode_entity_1.KoreanStockCode)
], FilteredPeak.prototype, "trCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], FilteredPeak.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], FilteredPeak.prototype, "date", void 0);
exports.FilteredPeak = FilteredPeak = __decorate([
    (0, typeorm_1.Entity)('filtered_peaks')
], FilteredPeak);
//# sourceMappingURL=FilterPeak.entity.js.map