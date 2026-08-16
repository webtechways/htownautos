"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentBuyer = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentBuyer = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.buyer;
});
//# sourceMappingURL=current-buyer.decorator.js.map