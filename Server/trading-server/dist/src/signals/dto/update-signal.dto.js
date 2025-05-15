"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSignalDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_signal_dto_1 = require("./create-signal.dto");
class UpdateSignalDto extends (0, mapped_types_1.PartialType)(create_signal_dto_1.CreateSignalDto) {
}
exports.UpdateSignalDto = UpdateSignalDto;
//# sourceMappingURL=update-signal.dto.js.map