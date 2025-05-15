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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const stock_data_module_1 = require("./stock-data/stock-data.module");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const DayStockData_entity_1 = require("./stock-data/entities/DayStockData.entity");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const Joi = __importStar(require("joi"));
const PeakPrice_entity_1 = require("./stock-data/entities/PeakPrice.entity");
const FilterPeak_entity_1 = require("./stock-data/entities/FilterPeak.entity");
const PeakDate_entity_1 = require("./stock-data/entities/PeakDate.entity");
const UserInflection_entity_1 = require("./stock-data/entities/UserInflection.entity");
const nestjs_session_1 = require("nestjs-session");
const live_index_module_1 = require("./live_index/live_index.module");
const gateway_module_1 = require("./gateway/gateway.module");
const microservices_1 = require("@nestjs/microservices");
const redis_module_1 = require("./redis/redis.module");
const KoreanStockCode_entity_1 = require("./stock-data/entities/KoreanStockCode.entity");
const WeekStockData_entity_1 = require("./stock-data/entities/WeekStockData.entity");
const excelupload_module_1 = require("./excelupload/excelupload.module");
const Alert_entity_1 = require("./stock-data/entities/Alert.entity");
const signals_module_1 = require("./signals/signals.module");
const typeOrmModuleOptions = {
    useFactory: async (configService) => ({
        namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
        type: 'mysql',
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        database: configService.get('DB_NAME'),
        charset: configService.get("CHAR_SET"),
        entities: [DayStockData_entity_1.DayStockData, PeakDate_entity_1.PeakDate, PeakPrice_entity_1.PeakPrice, FilterPeak_entity_1.FilteredPeak, UserInflection_entity_1.UserInflection, KoreanStockCode_entity_1.KoreanStockCode, WeekStockData_entity_1.WeekStockData, Alert_entity_1.Alert],
        synchronize: configService.get('DB_SYNC'),
        logging: true,
        timezone: '+09:00'
    }),
    inject: [config_1.ConfigService],
};
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [microservices_1.ClientsModule.register([
                {
                    name: 'REDIS_CLIENT',
                    transport: microservices_1.Transport.REDIS,
                    options: { host: "redis", port: 6379 },
                },
            ]), config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    DB_USERNAME: Joi.string().required(),
                    DB_PASSWORD: Joi.string().required(),
                    DB_HOST: Joi.string().required(),
                    DB_PORT: Joi.number().required(),
                    DB_NAME: Joi.string().required(),
                    CHAR_SET: Joi.string().required(),
                    DB_SYNC: Joi.boolean().required(),
                }),
            }),
            nestjs_session_1.SessionModule.forRoot({
                session: {
                    secret: 'mySecretKey',
                    resave: false,
                    saveUninitialized: false,
                    cookie: { maxAge: 1000 * 60 * 60 * 24 },
                },
            }),
            stock_data_module_1.StockDataModule, typeorm_1.TypeOrmModule.forRootAsync(typeOrmModuleOptions), live_index_module_1.LiveIndexModule, gateway_module_1.GatewayModule, redis_module_1.RedisModule, excelupload_module_1.ExceluploadModule, signals_module_1.SignalsModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map