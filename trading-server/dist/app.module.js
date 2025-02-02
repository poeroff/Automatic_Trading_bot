"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const stock_data_module_1 = require("./stock-data/stock-data.module");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const stock_datum_entity_1 = require("./stock-data/entities/stock-datum.entity");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const tr_code_entity_1 = require("./stock-data/entities/tr-code.entity");
const Joi = require("joi");
const PeakPrice_entity_1 = require("./stock-data/entities/PeakPrice.entity");
const filtered_peaks_entity_1 = require("./stock-data/entities/filtered-peaks.entity");
const peak_dates_entity_1 = require("./stock-data/entities/peak-dates.entity");
const user_inflection_entity_1 = require("./stock-data/entities/user-inflection.entity");
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
        entities: [stock_datum_entity_1.StockData, tr_code_entity_1.TrCode, peak_dates_entity_1.PeakDate, PeakPrice_entity_1.PeakPrice, filtered_peaks_entity_1.FilteredPeak, user_inflection_entity_1.UserInflection],
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
        imports: [config_1.ConfigModule.forRoot({
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
            }), stock_data_module_1.StockDataModule, typeorm_1.TypeOrmModule.forRootAsync(typeOrmModuleOptions)],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map