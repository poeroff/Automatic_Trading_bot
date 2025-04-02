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
exports.ExceluploadService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
const typeorm_1 = require("@nestjs/typeorm");
const KoreanStockCode_entity_1 = require("../stock-data/entities/KoreanStockCode.entity");
const typeorm_2 = require("typeorm");
let ExceluploadService = class ExceluploadService {
    constructor(koreanstockcoderepository) {
        this.koreanstockcoderepository = koreanstockcoderepository;
        this.filterWords = [
            'ETF', 'ETN', '선물',
            'KODEX', 'TIGER', 'KBSTAR',
            'SOL', 'ACE', 'VITA',
            'HANARO', 'KOSEF', 'KINDEX',
            'ARIRANG', 'SMART', 'FOCUS',
            'TIMEFOLIO', 'WOORI',
            '우B', '우C',
            '레버리지', '인버스',
            'KoAct', '채권', '스팩', 'PLUS',
            'RISE', 'KIWOOM', 'BNK', 'WON',
            '마이다스', '에셋플러스', 'KCGI', '리츠',
            '액티브', '인프라', '고배당'
        ];
    }
    excelDateToJSDate(date) {
        const jsDate = new Date((date - 25569) * 86400000);
        return jsDate;
    }
    formatJSDate(jsDate) {
        const year = jsDate.getFullYear();
        const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
        const day = jsDate.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    async koreanStockReadExcel(worksheet) {
        const range = XLSX.utils.decode_range(worksheet['!ref'] ?? "");
        const startRow = 1;
        const startCol = 0;
        const endCol = 8;
        for (let rowNum = startRow; rowNum <= range.e.r; rowNum++) {
            const rowValues = [];
            for (let colNum = startCol; colNum <= endCol; colNum++) {
                const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
                let cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : null;
                if (typeof cellValue === 'number') {
                    const jsDate = this.excelDateToJSDate(cellValue);
                    cellValue = this.formatJSDate(jsDate);
                }
                rowValues.push(cellValue);
            }
            if (typeof rowValues[0] === 'string') {
                const companyName = rowValues[0];
                if (this.filterWords.some(word => companyName.includes(word))) {
                    continue;
                }
            }
            const Company = await this.koreanstockcoderepository.findOne({ where: { company: rowValues[0] } });
            if (!Company) {
                await this.koreanstockcoderepository.save({ company: rowValues[0], code: rowValues[1], category: rowValues[2], products: rowValues[3], listed_date: rowValues[4], settlement_month: rowValues[5], representative: rowValues[6], homepage: rowValues[7], region: rowValues[8] });
            }
        }
    }
    findAll() {
        return `This action returns all excelupload`;
    }
    findOne(id) {
        return `This action returns a #${id} excelupload`;
    }
    update(id, updateExceluploadDto) {
        return `This action updates a #${id} excelupload`;
    }
    remove(id) {
        return `This action removes a #${id} excelupload`;
    }
};
exports.ExceluploadService = ExceluploadService;
exports.ExceluploadService = ExceluploadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(KoreanStockCode_entity_1.KoreanStockCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ExceluploadService);
//# sourceMappingURL=excelupload.service.js.map