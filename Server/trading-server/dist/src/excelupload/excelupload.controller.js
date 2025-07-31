"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceluploadController = void 0;
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
const excelupload_service_1 = require("./excelupload.service");
const platform_express_1 = require("@nestjs/platform-express");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
let ExceluploadController = class ExceluploadController {
    constructor(exceluploadService, redisClient, configService) {
        this.exceluploadService = exceluploadService;
        this.redisClient = redisClient;
        this.configService = configService;
        this.appkey = this.configService.get('appkey');
        this.appsecret = this.configService.get('appsecret');
        this.baseUrl = this.configService.get('baseUrl');
    }
    async koreanStockuUploadExcel(file) {
        if (!file) {
            throw new common_1.HttpException('No file uploaded', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!file.originalname.endsWith('.xlsx')) {
            throw new common_1.HttpException('Only .xlsx files are allowed', common_1.HttpStatus.BAD_REQUEST);
        }
        const fileName = file.originalname.toLowerCase();
        const stockMarket = fileName.includes('kospi') ? 'STK' : 'KSQ';
        const workbook = XLSX.read(file.buffer, { type: 'buffer', codepage: 949, raw: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        worksheet['A1'] = { v: 'company' };
        worksheet['B1'] = { v: 'code' };
        worksheet['C1'] = { v: 'category' };
        worksheet['D1'] = { v: 'products' };
        worksheet['E1'] = { v: 'listed_date' };
        worksheet['F1'] = { v: 'settlement_month' };
        worksheet['G1'] = { v: 'representative' };
        worksheet['H1'] = { v: 'homepage' };
        worksheet['I1'] = { v: 'region' };
        this.exceluploadService.koreanStockReadExcel(worksheet, stockMarket);
    }
    usaStockuUploadExcel() {
        return this.exceluploadService.findAll();
    }
};
exports.ExceluploadController = ExceluploadController;
__decorate([
    (0, common_1.Post)("korea"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExceluploadController.prototype, "koreanStockuUploadExcel", null);
__decorate([
    (0, common_1.Post)("USA"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExceluploadController.prototype, "usaStockuUploadExcel", null);
exports.ExceluploadController = ExceluploadController = __decorate([
    (0, common_1.Controller)('excelupload'),
    __param(1, (0, common_1.Inject)("REDIS_CLIENT")),
    __metadata("design:paramtypes", [excelupload_service_1.ExceluploadService, microservices_1.ClientProxy, config_1.ConfigService])
], ExceluploadController);
//# sourceMappingURL=excelupload.controller.js.map