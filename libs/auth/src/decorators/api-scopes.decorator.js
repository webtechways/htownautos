"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireApiScopes = exports.API_SCOPES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.API_SCOPES_KEY = 'apiScopes';
const RequireApiScopes = (...scopes) => (0, common_1.SetMetadata)(exports.API_SCOPES_KEY, scopes);
exports.RequireApiScopes = RequireApiScopes;
//# sourceMappingURL=api-scopes.decorator.js.map