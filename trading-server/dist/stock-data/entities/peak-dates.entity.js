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
exports.PeakDate = void 0;
const typeorm_1 = require("typeorm");
const tr_code_entity_1 = require("./tr-code.entity");
let PeakDate = class PeakDate {
};
exports.PeakDate = PeakDate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PeakDate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tr_code_entity_1.TrCode, (trCode) => trCode.peakDates, { onDelete: 'CASCADE' }),
    __metadata("design:type", tr_code_entity_1.TrCode)
], PeakDate.prototype, "trCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], PeakDate.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PeakDate.prototype, "date", void 0);
exports.PeakDate = PeakDate = __decorate([
    (0, typeorm_1.Entity)('peak_dates')
], PeakDate);
//# sourceMappingURL=peak-dates.entity.js.map