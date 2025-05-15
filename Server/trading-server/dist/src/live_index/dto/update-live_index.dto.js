"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLiveIndexDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_live_index_dto_1 = require("./create-live_index.dto");
class UpdateLiveIndexDto extends (0, mapped_types_1.PartialType)(create_live_index_dto_1.CreateLiveIndexDto) {
}
exports.UpdateLiveIndexDto = UpdateLiveIndexDto;
//# sourceMappingURL=update-live_index.dto.js.map