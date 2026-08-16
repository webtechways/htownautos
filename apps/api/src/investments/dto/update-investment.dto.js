"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInvestmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_investment_dto_1 = require("./create-investment.dto");
class UpdateInvestmentDto extends (0, swagger_1.PartialType)(create_investment_dto_1.CreateInvestmentDto) {
}
exports.UpdateInvestmentDto = UpdateInvestmentDto;
//# sourceMappingURL=update-investment.dto.js.map