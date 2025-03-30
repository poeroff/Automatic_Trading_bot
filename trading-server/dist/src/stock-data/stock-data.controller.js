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
    GetTrueCode() {
        return this.stockDataService.GetTrueCode();
    }
    StockData(body) {
        return this.stockDataService.StockData(body.code);
    }
    getAllCodes() {
        return this.stockDataService.getAllCodes();
    }
    getUserInflection(body) {
        return this.stockDataService.getUserInflection(body.code);
    }
    createUserInflection(body) {
        console.log("HELLO");
        if (body.code) {
            return this.stockDataService.createUserInflectioncode(body.date, body.code, body.highPoint);
        }
        else if (body.name) {
            return this.stockDataService.createUserInflectionname(body.date, body.name, body.highPoint);
        }
    }
    deleteUserInflection(body) {
        return this.stockDataService.deleteUserInflection(body.id);
    }
    getstockPoint(code, name) {
        if (code) {
            return this.stockDataService.getstockPoint(+code);
        }
        else if (name) {
            return this.stockDataService.getstockPoint(name);
        }
        return { message: 'No stock code or name provided' };
    }
    GetFalseCertified() {
        return this.stockDataService.getFalseCertified();
    }
    ReturnHighPeak(body) {
        return this.stockDataService.ReturnHighPeak(body.code);
    }
    ReturnInflectionPoint(body) {
        return this.stockDataService.ReturnInflectionPoint(body.code);
    }
};
exports.StockDataController = StockDataController;
__decorate([
    (0, common_1.Get)("TrueCode"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "GetTrueCode", null);
__decorate([
    (0, common_1.Post)("StockData"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "StockData", null);
__decorate([
    (0, common_1.Get)("get_all_codes"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "getAllCodes", null);
__decorate([
    (0, common_1.Get)("get_user_inflection"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "getUserInflection", null);
__decorate([
    (0, common_1.Post)("user-inflection"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "createUserInflection", null);
__decorate([
    (0, common_1.Delete)("user-inflection"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "deleteUserInflection", null);
__decorate([
    (0, common_1.Get)("stock"),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "getstockPoint", null);
__decorate([
    (0, common_1.Get)("FalseCertified"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "GetFalseCertified", null);
__decorate([
    (0, common_1.Post)("ReturnHighPeak"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "ReturnHighPeak", null);
__decorate([
    (0, common_1.Post)("ReturnInflectionPoint"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "ReturnInflectionPoint", null);
exports.StockDataController = StockDataController = __decorate([
    (0, common_1.Controller)('stock-data'),
    __metadata("design:paramtypes", [stock_data_service_1.StockDataService])
], StockDataController);
//# sourceMappingURL=stock-data.controller.js.map