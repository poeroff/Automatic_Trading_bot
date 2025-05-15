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
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const live_index_service_1 = require("../live_index/live_index.service");
let EventsGateway = class EventsGateway {
    constructor(liveIndexService) {
        this.liveIndexService = liveIndexService;
    }
    async Korea_main_stock_marketIndex() {
        try {
            const response = await this.liveIndexService.Korea_main_stock_marketIndex();
            this.server.emit('IndexData', response);
        }
        catch (error) {
            console.error(`🚨 KospiIndex 실행 중 오류 발생:`, error);
        }
    }
    async signals() {
        console.log("HELLO");
    }
    onModuleInit() {
        setInterval(async () => {
            await this.Korea_main_stock_marketIndex();
        }, 60000);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('Korea_main_stock_marketIndex'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "Korea_main_stock_marketIndex", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(81, { cors: true }),
    __metadata("design:paramtypes", [live_index_service_1.LiveIndexService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map