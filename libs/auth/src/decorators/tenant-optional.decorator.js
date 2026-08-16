"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantOptional = void 0;
const common_1 = require("@nestjs/common");
const tenant_guard_1 = require("../guards/tenant.guard");
const TenantOptional = () => (0, common_1.SetMetadata)(tenant_guard_1.TENANT_OPTIONAL_KEY, true);
exports.TenantOptional = TenantOptional;
//# sourceMappingURL=tenant-optional.decorator.js.map