"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSchedularDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_schedular_dto_1 = require("./create-schedular.dto");
class UpdateSchedularDto extends (0, mapped_types_1.PartialType)(create_schedular_dto_1.CreateSchedularDto) {
}
exports.UpdateSchedularDto = UpdateSchedularDto;
//# sourceMappingURL=update-schedular.dto.js.map