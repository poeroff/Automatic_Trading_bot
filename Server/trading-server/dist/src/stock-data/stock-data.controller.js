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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockDataController = void 0;
const common_1 = require("@nestjs/common");
const stock_data_service_1 = require("./stock-data.service");
let StockDataController = class StockDataController {
    constructor(stockDataService) {
        this.stockDataService = stockDataService;
    }
    trueCode() {
        return this.stockDataService.trueCode();
    }
    falseCertified() {
        return this.stockDataService.falseCertified();
    }
    createUserInflection(body) {
        if (body.code) {
            return this.stockDataService.createUserInflectioncode(body.date, body.code, body.highPoint);
        }
        else if (body.name) {
            return this.stockDataService.createUserInflectionname(body.date, body.name, body.highPoint);
        }
    }
    stockPoint(code, name) {
        if (code) {
            return this.stockDataService.stockPoint(code);
        }
        else if (name) {
            return this.stockDataService.stockPoint(name);
        }
        return { message: 'No stock code or name provided' };
    }
    updateCertified(code) {
        return this.stockDataService.updateCertifiedTrCode(code);
    }
    deleteUserInflection(body) {
        return this.stockDataService.deleteUserInflection(body.id);
    }
    returnHighPeak(body) {
        return this.stockDataService.returnHighPeak(body.code);
    }
    returnInflectionPoint(body) {
        return this.stockDataService.returnInflectionPoint(body.code);
    }
    stockData(body) {
        return this.stockDataService.StockData(body.code);
    }
};
exports.StockDataController = StockDataController;
__decorate([
    (0, common_1.Get)("TrueCode"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "trueCode", null);
__decorate([
    (0, common_1.Get)("FalseCertified"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "falseCertified", null);
__decorate([
    (0, common_1.Post)("user-inflection"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "createUserInflection", null);
__decorate([
    (0, common_1.Get)("stock"),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "stockPoint", null);
__decorate([
    (0, common_1.Patch)("certified"),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "updateCertified", null);
__decorate([
    (0, common_1.Delete)("user-inflection"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "deleteUserInflection", null);
__decorate([
    (0, common_1.Post)("ReturnHighPeak"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "returnHighPeak", null);
__decorate([
    (0, common_1.Post)("ReturnInflectionPoint"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "returnInflectionPoint", null);
__decorate([
    (0, common_1.Post)("StockData"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "stockData", null);
exports.StockDataController = StockDataController = __decorate([
    (0, common_1.Controller)('stock-data'),
    __metadata("design:paramtypes", [stock_data_service_1.StockDataService])
], StockDataController);
//# sourceMappingURL=stock-data.controller.js.map