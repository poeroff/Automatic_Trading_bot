"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = Get;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
async function Get(url, headers, params) {
    console.log(url);
    (0, axios_retry_1.default)(axios_1.default, {
        retries: 3,
        retryDelay: (retryCount) => retryCount * 1000,
        retryCondition: (error) => axios_retry_1.default.isNetworkOrIdempotentRequestError(error),
    });
    const response = await axios_1.default.get(url, { headers, params });
    return response;
}
//# sourceMappingURL=axios_get.js.map