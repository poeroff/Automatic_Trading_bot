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
const create_stock_datum_dto_1 = require("./dto/create-stock-datum.dto");
const update_stock_datum_dto_1 = require("./dto/update-stock-datum.dto");
let StockDataController = class StockDataController {
    constructor(stockDataService) {
        this.stockDataService = stockDataService;
    }
    create(createStockDatumDto) {
        return this.stockDataService.create(createStockDatumDto);
    }
    getAllCodes() {
        return this.stockDataService.getAllCodes();
    }
    gettrueCodes() {
        return this.stockDataService.gettrueCodes();
    }
    getStockData(body) {
        return this.stockDataService.getStockData(body.code);
    }
    getUserInflection(body) {
        return this.stockDataService.getUserInflection(body.code);
    }
    createUserInflection(body) {
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
    findOne(code, name) {
        if (code) {
            return this.stockDataService.findOneByTrCode(code);
        }
        else if (name) {
            return this.stockDataService.findOneByStockName(name);
        }
        return { message: 'No stock code or name provided' };
    }
    updateCertified(code, name) {
        if (code) {
            return this.stockDataService.updateCertifiedTrCode(code);
        }
        else if (name) {
            return this.stockDataService.updateCertifiedStockName(name);
        }
    }
    getFalseCertified() {
        return this.stockDataService.getFalseCertified();
    }
    update(id, updateStockDatumDto) {
        return this.stockDataService.update(+id, updateStockDatumDto);
    }
    remove(id) {
        return this.stockDataService.remove(+id);
    }
};
exports.StockDataController = StockDataController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_datum_dto_1.CreateStockDatumDto]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("get_all_codes"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "getAllCodes", null);
__decorate([
    (0, common_1.Get)("get_true_codes"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "gettrueCodes", null);
__decorate([
    (0, common_1.Post)("get_stock_data"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "getStockData", null);
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
], StockDataController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)("certified"),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "updateCertified", null);
__decorate([
    (0, common_1.Get)("false-certified"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "getFalseCertified", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_stock_datum_dto_1.UpdateStockDatumDto]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockDataController.prototype, "remove", null);
exports.StockDataController = StockDataController = __decorate([
    (0, common_1.Controller)('stock-data'),
    __metadata("design:paramtypes", [stock_data_service_1.StockDataService])
], StockDataController);
//# sourceMappingURL=stock-data.controller.js.map