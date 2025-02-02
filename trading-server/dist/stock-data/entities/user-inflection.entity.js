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
exports.UserInflection = void 0;
const typeorm_1 = require("typeorm");
const tr_code_entity_1 = require("./tr-code.entity");
let UserInflection = class UserInflection {
};
exports.UserInflection = UserInflection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserInflection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tr_code_entity_1.TrCode, (trCode) => trCode.userInflections),
    __metadata("design:type", tr_code_entity_1.TrCode)
], UserInflection.prototype, "trCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], UserInflection.prototype, "date", void 0);
exports.UserInflection = UserInflection = __decorate([
    (0, typeorm_1.Entity)('user_inflection')
], UserInflection);
//# sourceMappingURL=user-inflection.entity.js.map