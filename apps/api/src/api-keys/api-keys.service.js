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
var ApiKeysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const auth_1 = require("@htownautos/auth");
const crypto = __importStar(require("crypto"));
const KEY_PREFIX = 'hta_';
let ApiKeysService = ApiKeysService_1 = class ApiKeysService {
    prisma;
    logger = new common_1.Logger(ApiKeysService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    catalog() {
        return {
            resources: auth_1.API_SCOPE_RESOURCES,
            actions: auth_1.API_SCOPE_ACTIONS,
        };
    }
    async list(tenantId) {
        const keys = await this.prisma.apiKey.findMany({
            where: { tenantId },
            orderBy: [{ revokedAt: 'asc' }, { createdAt: 'desc' }],
        });
        return keys.map((k) => ({
            id: k.id,
            name: k.name,
            description: k.description,
            prefix: k.prefix,
            scopes: k.scopes,
            createdById: k.createdById,
            lastUsedAt: k.lastUsedAt,
            lastUsedIp: k.lastUsedIp,
            expiresAt: k.expiresAt,
            revokedAt: k.revokedAt,
            createdAt: k.createdAt,
            updatedAt: k.updatedAt,
            isActive: !k.revokedAt && (!k.expiresAt || k.expiresAt > new Date()),
        }));
    }
    async findOne(tenantId, id) {
        const key = await this.prisma.apiKey.findFirst({ where: { id, tenantId } });
        if (!key)
            throw new common_1.NotFoundException('API key not found');
        return key;
    }
    async create(tenantId, userId, dto) {
        const { valid, invalid } = (0, auth_1.validateScopes)(dto.scopes);
        if (invalid.length > 0) {
            throw new common_1.BadRequestException(`Invalid scopes: ${invalid.join(', ')}`);
        }
        if (valid.length === 0) {
            throw new common_1.BadRequestException('At least one scope is required');
        }
        const env = process.env.NODE_ENV === 'production' ? 'live' : 'test';
        const secret = crypto.randomBytes(20).toString('hex');
        const token = `${KEY_PREFIX}${env}_${secret}`;
        const prefix = token.slice(0, 12);
        const hashedKey = crypto.createHash('sha256').update(token).digest('hex');
        const created = await this.prisma.apiKey.create({
            data: {
                tenantId,
                createdById: userId,
                name: dto.name,
                description: dto.description,
                prefix,
                hashedKey,
                scopes: valid,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            },
        });
        this.logger.log(`API key created: ${prefix}… tenant=${tenantId} scopes=${valid.join(',')}`);
        return {
            id: created.id,
            name: created.name,
            prefix: created.prefix,
            scopes: created.scopes,
            expiresAt: created.expiresAt,
            createdAt: created.createdAt,
            token,
        };
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.scopes !== undefined) {
            const { valid, invalid } = (0, auth_1.validateScopes)(dto.scopes);
            if (invalid.length > 0) {
                throw new common_1.BadRequestException(`Invalid scopes: ${invalid.join(', ')}`);
            }
            data.scopes = valid;
        }
        if (dto.expiresAt !== undefined) {
            data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
        }
        return this.prisma.apiKey.update({ where: { id }, data });
    }
    async revoke(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.apiKey.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        await this.prisma.apiKey.delete({ where: { id } });
        return { message: 'API key deleted' };
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = ApiKeysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map