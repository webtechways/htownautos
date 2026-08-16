"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ApiKeyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_1 = require("@htownautos/prisma");
const crypto = __importStar(require("crypto"));
const public_decorator_1 = require("../decorators/public.decorator");
const api_scopes_decorator_1 = require("../decorators/api-scopes.decorator");
const api_scopes_1 = require("../constants/api-scopes");
let ApiKeyGuard = class ApiKeyGuard {
    static { ApiKeyGuard_1 = this; }
    reflector;
    prisma;
    logger = new common_1.Logger(ApiKeyGuard_1.name);
    static KEY_PREFIX = 'hta_';
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        const rawKey = this.extractKey(request);
        if (!rawKey)
            return true;
        const hashedKey = this.hash(rawKey);
        const key = await this.prisma.apiKey.findUnique({
            where: { hashedKey },
            include: { tenant: true },
        });
        if (!key)
            throw new common_1.UnauthorizedException('Invalid API key');
        if (key.revokedAt)
            throw new common_1.UnauthorizedException('API key revoked');
        if (key.expiresAt && key.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('API key expired');
        }
        if (!key.tenant || !key.tenant.isActive) {
            throw new common_1.UnauthorizedException('Tenant inactive');
        }
        const requiredScopes = this.reflector.getAllAndOverride(api_scopes_decorator_1.API_SCOPES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || [];
        for (const required of requiredScopes) {
            if (!(0, api_scopes_1.hasScope)(key.scopes, required)) {
                throw new common_1.ForbiddenException(`API key is missing required scope: ${required}`);
            }
        }
        request.apiKey = { id: key.id, prefix: key.prefix, scopes: key.scopes };
        request.tenant = key.tenant;
        request.user = {
            id: `api-key:${key.id}`,
            clerkUserId: null,
            email: `api-key+${key.prefix}@${key.tenant.slug}.internal`,
            name: key.name,
            firstName: null,
            lastName: null,
            phoneNumber: null,
            avatar: null,
            isActive: true,
            emailVerified: true,
            tenants: [
                {
                    id: key.id,
                    tenantId: key.tenantId,
                    roleId: '',
                    isActive: true,
                    tenant: {
                        id: key.tenant.id,
                        name: key.tenant.name,
                        slug: key.tenant.slug,
                    },
                },
            ],
        };
        this.prisma.apiKey
            .update({
            where: { id: key.id },
            data: {
                lastUsedAt: new Date(),
                lastUsedIp: this.getClientIp(request),
            },
        })
            .catch((err) => this.logger.warn(`Failed to stamp API key usage: ${err.message}`));
        return true;
    }
    extractKey(request) {
        const headerKey = request.headers['x-api-key'];
        if (typeof headerKey === 'string' && headerKey.startsWith(ApiKeyGuard_1.KEY_PREFIX)) {
            return headerKey;
        }
        const auth = request.headers['authorization'];
        if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
            const token = auth.substring(7);
            if (token.startsWith(ApiKeyGuard_1.KEY_PREFIX))
                return token;
        }
        return null;
    }
    hash(raw) {
        return crypto.createHash('sha256').update(raw).digest('hex');
    }
    getClientIp(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded)
            return forwarded.split(',')[0]?.trim() || 'unknown';
        return request.headers['x-real-ip'] || request.ip || 'unknown';
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = ApiKeyGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_1.PrismaService])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map