"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMetaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_meta_dto_1 = require("./create-meta.dto");
class UpdateMetaDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_meta_dto_1.CreateMetaDto, ['entityType', 'entityId'])) {
}
exports.UpdateMetaDto = UpdateMetaDto;
//# sourceMappingURL=update-meta.dto.js.map