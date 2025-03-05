"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveIndexModule = void 0;
const common_1 = require("@nestjs/common");
const live_index_service_1 = require("./live_index.service");
const live_index__controller_1 = require("./live_index..controller");
const schedular_module_1 = require("../schedular/schedular.module");
const redis_module_1 = require("../redis/redis.module");
let LiveIndexModule = class LiveIndexModule {
};
exports.LiveIndexModule = LiveIndexModule;
exports.LiveIndexModule = LiveIndexModule = __decorate([
    (0, common_1.Module)({
        imports: [schedular_module_1.SchedularModule, redis_module_1.RedisModule],
        controllers: [live_index__controller_1.LiveIndexController],
        providers: [live_index_service_1.LiveIndexService],
        exports: [live_index_service_1.LiveIndexService],
    })
], LiveIndexModule);
//# sourceMappingURL=live_index.module.js.map