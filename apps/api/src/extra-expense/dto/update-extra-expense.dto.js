"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExtraExpenseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_extra_expense_dto_1 = require("./create-extra-expense.dto");
class UpdateExtraExpenseDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_extra_expense_dto_1.CreateExtraExpenseDto, ['vehicleId'])) {
}
exports.UpdateExtraExpenseDto = UpdateExtraExpenseDto;
//# sourceMappingURL=update-extra-expense.dto.js.map