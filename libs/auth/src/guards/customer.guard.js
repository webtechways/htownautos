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
var CustomerGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerGuard = exports.PORTAL_TENANT_ID = void 0;
const common_1 = require("@nestjs/common");
const backend_1 = require("@clerk/backend");
const prisma_1 = require("@htownautos/prisma");
exports.PORTAL_TENANT_ID = '50197477-9e89-4465-bed5-99c638c435a0';
const BUYER_SELECT = {
    id: true,
    tenantId: true,
    clerkUserId: true,
    firstName: true,
    lastName: true,
    email: true,
    phoneMain: true,
    phoneMobile: true,
    phoneSecondary: true,
    currentAddress: true,
    currentCity: true,
    currentState: true,
    currentZipCode: true,
    currentCountry: true,
    stripeCustomerId: true,
    createdAt: true,
    updatedAt: true,
};
let CustomerGuard = CustomerGuard_1 = class CustomerGuard {
    prisma;
    logger = new common_1.Logger(CustomerGuard_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        let payload;
        try {
            payload = await (0, backend_1.verifyToken)(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
        }
        catch (err) {
            this.logger.warn(`CustomerGuard: token verification failed — ${err.message}`);
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        const orgId = payload.org_id || payload.o?.id;
        if (orgId) {
            throw new common_1.ForbiddenException('Staff accounts cannot access the customer portal');
        }
        const clerkUserId = payload.sub;
        const userMeta = this.extractUserMeta(request);
        const buyer = await this.getOrProvisionBuyer(clerkUserId, userMeta);
        request.buyer = buyer;
        request.tenantId = buyer.tenantId;
        return true;
    }
    extractToken(request) {
        const auth = request.headers.authorization;
        if (auth?.startsWith('Bearer '))
            return auth.substring(7);
        return null;
    }
    extractUserMeta(request) {
        try {
            const raw = request.headers['x-clerk-user'];
            if (!raw)
                return null;
            return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
        }
        catch {
            return null;
        }
    }
    async mergeEmailDuplicates(authenticatedBuyer) {
        try {
            const duplicates = await this.prisma.buyer.findMany({
                where: {
                    tenantId: exports.PORTAL_TENANT_ID,
                    id: { not: authenticatedBuyer.id },
                    email: { equals: authenticatedBuyer.email, mode: 'insensitive' },
                },
                select: {
                    id: true,
                    currentAddress: true,
                    phoneMain: true,
                    clerkUserId: true,
                    createdAt: true,
                },
            });
            if (duplicates.length === 0)
                return authenticatedBuyer;
            this.logger.log(`mergeEmailDuplicates: found ${duplicates.length} duplicate(s) for buyer ${authenticatedBuyer.id} (${authenticatedBuyer.email})`);
            const candidates = [
                {
                    id: authenticatedBuyer.id,
                    hasCompleteProfile: !!authenticatedBuyer.currentAddress && !!authenticatedBuyer.phoneMain,
                    createdAt: authenticatedBuyer.createdAt,
                    clerkUserId: authenticatedBuyer.clerkUserId,
                },
                ...duplicates.map((d) => ({
                    id: d.id,
                    hasCompleteProfile: !!d.currentAddress && d.currentAddress.length > 0 &&
                        !!d.phoneMain && d.phoneMain.length > 0,
                    createdAt: d.createdAt,
                    clerkUserId: d.clerkUserId,
                })),
            ];
            candidates.sort((a, b) => {
                if (a.hasCompleteProfile !== b.hasCompleteProfile) {
                    return a.hasCompleteProfile ? -1 : 1;
                }
                return a.createdAt.getTime() - b.createdAt.getTime();
            });
            const survivorId = candidates[0].id;
            const dupeIds = candidates.slice(1).map((c) => c.id);
            if (survivorId === authenticatedBuyer.id && dupeIds.length === 0) {
                return authenticatedBuyer;
            }
            this.logger.log(`mergeEmailDuplicates: survivor=${survivorId}, dupes=[${dupeIds.join(', ')}]`);
            await this.prisma.$transaction(async (tx) => {
                const survivorHasClerk = candidates[0].clerkUserId != null;
                if (!survivorHasClerk) {
                    const withClerk = candidates.find((c) => c.clerkUserId != null);
                    if (withClerk) {
                        await tx.buyer.update({
                            where: { id: survivorId },
                            data: { clerkUserId: withClerk.clerkUserId },
                        });
                    }
                }
                for (const dupeId of dupeIds) {
                    await tx.vehicleInspection.updateMany({
                        where: { buyerId: dupeId },
                        data: { buyerId: survivorId },
                    });
                    await tx.buyerFavorite.updateMany({
                        where: { buyerId: dupeId },
                        data: { buyerId: survivorId },
                    });
                    await tx.portalOrder.updateMany({
                        where: { buyerId: dupeId },
                        data: { buyerId: survivorId },
                    });
                    await tx.customerLedgerEntry.updateMany({
                        where: { buyerId: dupeId },
                        data: { buyerId: survivorId },
                    });
                }
                await tx.buyer.deleteMany({
                    where: { id: { in: dupeIds }, tenantId: exports.PORTAL_TENANT_ID },
                });
            });
            const survivor = await this.prisma.buyer.findUnique({
                where: { id: survivorId },
                select: BUYER_SELECT,
            });
            if (!survivor) {
                this.logger.warn(`mergeEmailDuplicates: survivor ${survivorId} not found after merge — returning original`);
                return authenticatedBuyer;
            }
            return survivor;
        }
        catch (err) {
            this.logger.error(`mergeEmailDuplicates: failed for buyer ${authenticatedBuyer.id} — ${err.message}`);
            return authenticatedBuyer;
        }
    }
    async getOrProvisionBuyer(clerkUserId, meta) {
        const existing = await this.prisma.buyer.findUnique({
            where: { clerkUserId },
            select: BUYER_SELECT,
        });
        if (existing) {
            const survivor = await this.mergeEmailDuplicates(existing);
            return survivor;
        }
        const email = meta?.email ?? '';
        const firstName = meta?.first_name ?? '';
        const lastName = meta?.last_name ?? '';
        if (!email) {
            throw new common_1.UnauthorizedException('Email is required to create a portal account. Ensure the X-Clerk-User header is present.');
        }
        const byEmail = await this.prisma.buyer.findFirst({
            where: {
                tenantId: exports.PORTAL_TENANT_ID,
                clerkUserId: null,
                email: { equals: email, mode: 'insensitive' },
            },
            select: { id: true },
        });
        if (byEmail) {
            this.logger.log(`Linking portal login to existing buyer ${byEmail.id} (${email})`);
            const linked = await this.prisma.buyer.update({
                where: { id: byEmail.id },
                data: { clerkUserId },
                select: BUYER_SELECT,
            });
            return linked;
        }
        this.logger.log(`Auto-provisioning portal buyer: ${email} (Clerk: ${clerkUserId})`);
        try {
            const created = await this.prisma.buyer.create({
                data: {
                    clerkUserId,
                    tenantId: exports.PORTAL_TENANT_ID,
                    firstName: firstName || 'Portal',
                    lastName: lastName || 'User',
                    email,
                    phoneMain: '',
                    dateOfBirth: new Date('1900-01-01'),
                    currentAddress: '',
                    currentCity: '',
                    currentState: '',
                    currentZipCode: '',
                    currentCountry: 'USA',
                },
                select: BUYER_SELECT,
            });
            return created;
        }
        catch (err) {
            if (err?.code === 'P2002') {
                const retry = await this.prisma.buyer.findUnique({
                    where: { clerkUserId },
                    select: BUYER_SELECT,
                });
                if (retry)
                    return retry;
            }
            throw err;
        }
    }
};
exports.CustomerGuard = CustomerGuard;
exports.CustomerGuard = CustomerGuard = CustomerGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], CustomerGuard);
//# sourceMappingURL=customer.guard.js.map