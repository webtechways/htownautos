"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAuth = CustomerAuth;
const common_1 = require("@nestjs/common");
const customer_guard_1 = require("../guards/customer.guard");
function CustomerAuth() {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(customer_guard_1.CustomerGuard));
}
//# sourceMappingURL=customer-auth.decorator.js.map