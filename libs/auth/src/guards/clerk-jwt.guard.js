"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClerkJwtGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const backend_1 = require("@clerk/backend");
const public_decorator_1 = require("../decorators/public.decorator");
const prisma_1 = require("@htownautos/prisma");
let ClerkJwtGuard = ClerkJwtGuard_1 = class ClerkJwtGuard {
    reflector;
    prisma;
    logger = new common_1.Logger(ClerkJwtGuard_1.name);
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        if (request.apiKey && request.user) {
            return true;
        }
        const token = this.extractToken(request);
        if (!token) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            const payload = await (0, backend_1.verifyToken)(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            const clerkUserId = payload.sub;
            const userMeta = this.extractUserMeta(request);
            const user = await this.getOrCreateUser(clerkUserId, userMeta, request);
            request.clerkOrgId = payload.org_id || payload.o?.id || null;
            request.clerkOrgRole = payload.org_role || (payload.o?.rol ? `org:${payload.o.rol}` : null);
            request.user = user;
            request.session = { user };
            return true;
        }
        catch (error) {
            this.logger.error('Token verification failed:', error);
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
    extractToken(request) {
        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }
    extractUserMeta(request) {
        try {
            const meta = request.headers['x-clerk-user'];
            if (!meta)
                return null;
            return JSON.parse(Buffer.from(meta, 'base64').toString('utf8'));
        }
        catch {
            return null;
        }
    }
    async getOrCreateUser(clerkUserId, userMeta, request) {
        const startTime = Date.now();
        const email = userMeta?.email || '';
        const tenantInclude = {
            tenants: {
                where: { isActive: true, status: 'active' },
                include: {
                    tenant: {
                        select: { id: true, name: true, slug: true },
                    },
                },
            },
        };
        let user = await this.prisma.user.findUnique({
            where: { clerkUserId },
            include: tenantInclude,
        });
        if (!user && email) {
            const existingUserByEmail = await this.prisma.user.findUnique({
                where: { email },
                include: {
                    tenants: {
                        where: { isActive: true },
                        include: {
                            tenant: { select: { id: true, name: true, slug: true } },
                        },
                    },
                },
            });
            if (existingUserByEmail) {
                const firstName = userMeta?.first_name || existingUserByEmail.firstName;
                const lastName = userMeta?.last_name || existingUserByEmail.lastName;
                const name = userMeta?.full_name || existingUserByEmail.name;
                const avatar = userMeta?.image_url || existingUserByEmail.avatar;
                const emailVerified = userMeta?.email_verified ?? existingUserByEmail.emailVerified;
                this.logger.log(`Linking existing user ${email} to Clerk ID ${clerkUserId}`);
                user = await this.prisma.user.update({
                    where: { id: existingUserByEmail.id },
                    data: {
                        clerkUserId,
                        name: name || existingUserByEmail.name,
                        firstName,
                        lastName,
                        avatar,
                        emailVerified,
                        isActive: true,
                    },
                    include: tenantInclude,
                });
                const duration = Date.now() - startTime;
                await this.createAuthAuditLog({
                    userId: user.id,
                    userEmail: email,
                    clerkUserId,
                    action: 'user-linked',
                    status: 'success',
                    ipAddress: this.getClientIp(request),
                    userAgent: request.headers['user-agent'] || 'unknown',
                    duration,
                    metadata: { previousClerkUserId: existingUserByEmail.clerkUserId },
                });
            }
        }
        if (!user) {
            const firstName = userMeta?.first_name || null;
            const lastName = userMeta?.last_name || null;
            const name = userMeta?.full_name || null;
            const avatar = userMeta?.image_url || null;
            const emailVerified = userMeta?.email_verified ?? false;
            if (!email) {
                throw new common_1.UnauthorizedException('Email required for user creation. Make sure X-Clerk-User header is provided.');
            }
            this.logger.log(`Auto-provisioning new user: ${email} (Clerk: ${clerkUserId})`);
            user = await this.prisma.user.create({
                data: {
                    clerkUserId,
                    email,
                    name,
                    firstName,
                    lastName,
                    avatar,
                    emailVerified,
                    isActive: true,
                },
                include: tenantInclude,
            });
            const duration = Date.now() - startTime;
            await this.createAuthAuditLog({
                userId: user.id,
                userEmail: email,
                clerkUserId,
                action: 'user-created',
                status: 'success',
                ipAddress: this.getClientIp(request),
                userAgent: request.headers['user-agent'] || 'unknown',
                duration,
                metadata: { name, firstName, lastName, emailVerified },
            });
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User is inactive');
        }
        return {
            id: user.id,
            clerkUserId: user.clerkUserId,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            tenants: user.tenants.map((t) => ({
                id: t.id,
                tenantId: t.tenantId,
                roleId: t.roleId,
                isActive: t.isActive,
                tenant: t.tenant,
            })),
        };
    }
    getClientIp(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0]?.trim() || 'unknown';
        }
        return request.headers['x-real-ip'] || request.ip || request.connection?.remoteAddress || 'unknown';
    }
    async createAuthAuditLog(data) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    userEmail: data.userEmail,
                    action: data.action,
                    resource: 'auth',
                    method: 'POST',
                    url: '/auth',
                    ipAddress: data.ipAddress || 'unknown',
                    userAgent: data.userAgent || 'unknown',
                    duration: data.duration,
                    status: data.status,
                    level: 'critical',
                    pii: true,
                    compliance: ['glba'],
                    metadata: {
                        clerkUserId: data.clerkUserId,
                        ...data.metadata,
                    },
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to create auth audit log: ${error.message}`);
        }
    }
};
exports.ClerkJwtGuard = ClerkJwtGuard;
exports.ClerkJwtGuard = ClerkJwtGuard = ClerkJwtGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_1.PrismaService])
], ClerkJwtGuard);
//# sourceMappingURL=clerk-jwt.guard.js.map