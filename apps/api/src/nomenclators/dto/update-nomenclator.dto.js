"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNomenclatorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_nomenclator_dto_1 = require("./create-nomenclator.dto");
class UpdateNomenclatorDto extends (0, swagger_1.PartialType)(create_nomenclator_dto_1.CreateNomenclatorDto) {
}
exports.UpdateNomenclatorDto = UpdateNomenclatorDto;
//# sourceMappingURL=update-nomenclator.dto.js.map