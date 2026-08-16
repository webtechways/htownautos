"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateYardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_yard_dto_1 = require("./create-yard.dto");
class UpdateYardDto extends (0, swagger_1.PartialType)(create_yard_dto_1.CreateYardDto) {
}
exports.UpdateYardDto = UpdateYardDto;
//# sourceMappingURL=update-yard.dto.js.map