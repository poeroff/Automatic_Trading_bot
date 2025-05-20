"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStockRankingDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_stock_ranking_dto_1 = require("./create-stock-ranking.dto");
class UpdateStockRankingDto extends (0, mapped_types_1.PartialType)(create_stock_ranking_dto_1.CreateStockRankingDto) {
}
exports.UpdateStockRankingDto = UpdateStockRankingDto;
//# sourceMappingURL=update-stock-ranking.dto.js.map