"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OWNER_ONLY = exports.ADMIN_ROLES = exports.RequireRoles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
const RequireRoles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.RequireRoles = RequireRoles;
exports.ADMIN_ROLES = ['owner', 'admin', 'manager'];
exports.OWNER_ONLY = ['owner'];
//# sourceMappingURL=roles.decorator.js.map