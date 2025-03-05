"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
let SessionService = class SessionService {
    constructor() {
        this.hashKey = null;
        this.AccessToken = null;
        this.WebSocketToken = null;
    }
    setHashKey(hash) {
        this.hashKey = hash;
    }
    getHashKey() {
        return this.hashKey;
    }
    setAccessToken(AccessToken) {
        this.AccessToken = AccessToken;
    }
    getAccessToken() {
        return this.AccessToken;
    }
    setWebSocketToken(WebSocketToken) {
        this.WebSocketToken = WebSocketToken;
    }
    getWebSocketToken() {
        return this.WebSocketToken;
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)()
], SessionService);
//# sourceMappingURL=SessionService.js.map