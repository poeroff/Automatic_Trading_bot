"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStockDatumDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_stock_datum_dto_1 = require("./create-stock-datum.dto");
class UpdateStockDatumDto extends (0, mapped_types_1.PartialType)(create_stock_datum_dto_1.CreateStockDatumDto) {
}
exports.UpdateStockDatumDto = UpdateStockDatumDto;
//# sourceMappingURL=update-stock-datum.dto.js.map