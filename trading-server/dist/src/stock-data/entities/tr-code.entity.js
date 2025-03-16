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
exports.TrCode = void 0;
const typeorm_1 = require("typeorm");
const peak_dates_entity_1 = require("./peak-dates.entity");
const PeakPrice_entity_1 = require("./PeakPrice.entity");
const filtered_peaks_entity_1 = require("./filtered-peaks.entity");
const user_inflection_entity_1 = require("./user-inflection.entity");
let TrCode = class TrCode {
};
exports.TrCode = TrCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TrCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], TrCode.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], TrCode.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TrCode.prototype, "certified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TrCode.prototype, "current_inflection_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TrCode.prototype, "previous_inflection_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TrCode.prototype, "previous_peak_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TrCode.prototype, "current_peak_count", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => peak_dates_entity_1.PeakDate, (peakDate) => peakDate.trCode),
    __metadata("design:type", Array)
], TrCode.prototype, "peakDates", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PeakPrice_entity_1.PeakPrice, (peakPrice) => peakPrice.trCode),
    __metadata("design:type", Array)
], TrCode.prototype, "peakPrices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => filtered_peaks_entity_1.FilteredPeak, (filteredPeak) => filteredPeak.trCode),
    __metadata("design:type", Array)
], TrCode.prototype, "filteredPeaks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_inflection_entity_1.UserInflection, (userInflection) => userInflection.trCode),
    __metadata("design:type", Array)
], TrCode.prototype, "userInflections", void 0);
exports.TrCode = TrCode = __decorate([
    (0, typeorm_1.Entity)('tr_codes')
], TrCode);
//# sourceMappingURL=tr-code.entity.js.map