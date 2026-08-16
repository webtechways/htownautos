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
var BuyersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_1 = require("@htownautos/prisma");
const auth_1 = require("@htownautos/auth");
const buyer_entity_1 = require("./entities/buyer.entity");
const common_2 = require("@htownautos/common");
const crypto_1 = require("crypto");
const BUYER_INCLUDE = {
    gender: { select: { id: true, title: true } },
    preferredLanguage: { select: { id: true, title: true } },
    employmentStatus: { select: { id: true, title: true } },
    occupation: { select: { id: true, title: true } },
    idType: { select: { id: true, title: true } },
    idState: { select: { id: true, title: true } },
    salesperson: {
        select: {
            id: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            role: { select: { id: true, name: true, slug: true } },
        },
    },
    bdcAgent: {
        select: {
            id: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            role: { select: { id: true, name: true, slug: true } },
        },
    },
};
const GENERATED_PASSWORD_BYTES = 32;
let BuyersService = BuyersService_1 = class BuyersService {
    prisma;
    clerkService;
    logger = new common_1.Logger(BuyersService_1.name);
    buyer;
    constructor(prisma, clerkService) {
        this.prisma = prisma;
        this.clerkService = clerkService;
        this.buyer = prisma.getModel('buyer');
    }
    async create(dto, tenantId) {
        const phoneMain = (0, common_2.normalizePhoneNumber)(dto.phoneMain);
        const phoneSecondary = (0, common_2.normalizePhoneNumber)(dto.phoneSecondary);
        const phoneMobile = (0, common_2.normalizePhoneNumber)(dto.phoneMobile);
        const employerPhone = (0, common_2.normalizePhoneNumber)(dto.employerPhone);
        const data = {
            firstName: dto.firstName,
            middleName: dto.middleName,
            lastName: dto.lastName,
            suffix: dto.suffix,
            dateOfBirth: new Date(dto.dateOfBirth),
            email: dto.email,
            phoneMain: phoneMain || dto.phoneMain,
            phoneSecondary: phoneSecondary || undefined,
            phoneMobile: phoneMobile || undefined,
            currentAddress: dto.currentAddress,
            currentCity: dto.currentCity,
            currentState: dto.currentState,
            currentZipCode: dto.currentZipCode,
            currentCountry: dto.currentCountry ?? 'USA',
            ...(tenantId && { tenant: { connect: { id: tenantId } } }),
            ...(dto.genderId && { gender: { connect: { id: dto.genderId } } }),
            ...(dto.preferredLanguageId && { preferredLanguage: { connect: { id: dto.preferredLanguageId } } }),
            ...(dto.employmentStatusId && { employmentStatus: { connect: { id: dto.employmentStatusId } } }),
            ...(dto.occupationId && { occupation: { connect: { id: dto.occupationId } } }),
            ...(dto.idTypeId && { idType: { connect: { id: dto.idTypeId } } }),
            ...(dto.idStateId && { idState: { connect: { id: dto.idStateId } } }),
            ...(dto.ssn && { ssn: dto.ssn }),
            ...(dto.itin && { itin: dto.itin }),
            ...(dto.citizenship && { citizenship: dto.citizenship }),
            ...(dto.yearsAtAddress !== undefined && { yearsAtAddress: dto.yearsAtAddress }),
            ...(dto.monthsAtAddress !== undefined && { monthsAtAddress: dto.monthsAtAddress }),
            ...(dto.housingStatus && { housingStatus: dto.housingStatus }),
            ...(dto.monthlyHousingCost !== undefined && { monthlyHousingCost: new client_1.Prisma.Decimal(dto.monthlyHousingCost) }),
            ...(dto.previousAddress && { previousAddress: dto.previousAddress }),
            ...(dto.previousCity && { previousCity: dto.previousCity }),
            ...(dto.previousState && { previousState: dto.previousState }),
            ...(dto.previousZipCode && { previousZipCode: dto.previousZipCode }),
            ...(dto.previousCountry && { previousCountry: dto.previousCountry }),
            ...(dto.yearsAtPreviousAddress !== undefined && { yearsAtPreviousAddress: dto.yearsAtPreviousAddress }),
            ...(dto.monthsAtPreviousAddress !== undefined && { monthsAtPreviousAddress: dto.monthsAtPreviousAddress }),
            ...(dto.idNumber && { idNumber: dto.idNumber }),
            ...(dto.idExpirationDate && { idExpirationDate: new Date(dto.idExpirationDate) }),
            ...(dto.idIssueDate && { idIssueDate: new Date(dto.idIssueDate) }),
            ...(dto.driversLicenseNumber && { driversLicenseNumber: dto.driversLicenseNumber }),
            ...(dto.driversLicenseState && { driversLicenseState: dto.driversLicenseState }),
            ...(dto.driversLicenseExpiration && { driversLicenseExpiration: new Date(dto.driversLicenseExpiration) }),
            ...(dto.currentEmployer && { currentEmployer: dto.currentEmployer }),
            ...(dto.employerPhone && { employerPhone: employerPhone || dto.employerPhone }),
            ...(dto.jobTitle && { jobTitle: dto.jobTitle }),
            ...(dto.monthlyIncome !== undefined && { monthlyIncome: new client_1.Prisma.Decimal(dto.monthlyIncome) }),
            ...(dto.yearsEmployed !== undefined && { yearsEmployed: dto.yearsEmployed }),
            ...(dto.monthsEmployed !== undefined && { monthsEmployed: dto.monthsEmployed }),
            ...(dto.creditScore !== undefined && { creditScore: dto.creditScore }),
            ...(dto.isBusinessBuyer !== undefined && { isBusinessBuyer: dto.isBusinessBuyer }),
            ...(dto.businessName && { businessName: dto.businessName }),
            ...(dto.businessEIN && { businessEIN: dto.businessEIN }),
            ...(dto.source && { source: dto.source }),
            ...(dto.leadType && { leadType: dto.leadType }),
            ...(dto.leadSource && { leadSource: dto.leadSource }),
            ...(dto.inquiryType && { inquiryType: dto.inquiryType }),
            ...(dto.contactMethod && { contactMethod: dto.contactMethod }),
            ...(dto.contactTime && { contactTime: dto.contactTime }),
            ...(dto.notes && { notes: dto.notes }),
            ...(dto.metaValue && { metaValue: dto.metaValue }),
            ...(dto.salesPersonId && { salesperson: { connect: { id: dto.salesPersonId } } }),
            ...(dto.bdcAgentId && { bdcAgent: { connect: { id: dto.bdcAgentId } } }),
        };
        const record = await this.buyer.create({
            data,
            include: BUYER_INCLUDE,
        });
        if (tenantId === auth_1.PORTAL_TENANT_ID && record.email) {
            await this.linkClerkAccount(record.id, record.email, record.firstName, record.lastName);
            const updated = await this.buyer.findUnique({
                where: { id: record.id },
                include: BUYER_INCLUDE,
            });
            if (updated)
                return new buyer_entity_1.BuyerEntity(updated);
        }
        return new buyer_entity_1.BuyerEntity(record);
    }
    async findAll(query, tenantId) {
        const { page = 1, limit = 10, search, email, lastName, phone, city, state, isBusinessBuyer } = query;
        const where = {
            tenantId: tenantId || undefined,
        };
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phoneMain: { contains: search } },
                { phoneMobile: { contains: search } },
            ];
        }
        if (email) {
            where.email = { contains: email, mode: 'insensitive' };
        }
        if (lastName) {
            where.lastName = { contains: lastName, mode: 'insensitive' };
        }
        if (phone) {
            where.OR = [
                { phoneMain: { contains: phone } },
                { phoneMobile: { contains: phone } },
                { phoneSecondary: { contains: phone } },
            ];
        }
        if (city) {
            where.currentCity = { contains: city, mode: 'insensitive' };
        }
        if (state) {
            where.currentState = { equals: state, mode: 'insensitive' };
        }
        if (isBusinessBuyer !== undefined) {
            where.isBusinessBuyer = isBusinessBuyer;
        }
        const [data, total] = await Promise.all([
            this.buyer.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: BUYER_INCLUDE,
            }),
            this.buyer.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: data.map((row) => new buyer_entity_1.BuyerEntity(row)),
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id, tenantId) {
        const record = await this.buyer.findFirst({
            where: { id, tenantId: tenantId || undefined },
            include: BUYER_INCLUDE,
        });
        if (!record) {
            throw new common_1.NotFoundException(`Buyer ${id} not found`);
        }
        return new buyer_entity_1.BuyerEntity(record);
    }
    async update(id, dto, tenantId) {
        await this.ensureBuyerExists(id, tenantId);
        const data = {};
        const phoneFields = ['phoneMain', 'phoneSecondary', 'phoneMobile', 'employerPhone'];
        for (const field of phoneFields) {
            if (dto[field] !== undefined) {
                const normalized = (0, common_2.normalizePhoneNumber)(dto[field]);
                data[field] = normalized || dto[field];
            }
        }
        const simpleFields = [
            'firstName', 'middleName', 'lastName', 'suffix', 'email',
            'ssn', 'itin', 'citizenship',
            'currentAddress', 'currentCity', 'currentState', 'currentZipCode', 'currentCountry',
            'yearsAtAddress', 'monthsAtAddress', 'housingStatus',
            'previousAddress', 'previousCity', 'previousState', 'previousZipCode', 'previousCountry',
            'yearsAtPreviousAddress', 'monthsAtPreviousAddress',
            'idNumber', 'driversLicenseNumber', 'driversLicenseState',
            'currentEmployer', 'jobTitle', 'yearsEmployed', 'monthsEmployed',
            'creditScore', 'isBusinessBuyer', 'businessName', 'businessEIN',
            'source', 'leadType', 'leadSource', 'inquiryType', 'contactMethod', 'contactTime',
            'notes', 'metaValue',
        ];
        for (const field of simpleFields) {
            if (dto[field] !== undefined) {
                data[field] = dto[field];
            }
        }
        const dateFields = ['dateOfBirth', 'idExpirationDate', 'idIssueDate', 'driversLicenseExpiration'];
        for (const field of dateFields) {
            if (dto[field]) {
                data[field] = new Date(dto[field]);
            }
        }
        const decimalFields = ['monthlyHousingCost', 'monthlyIncome'];
        for (const field of decimalFields) {
            if (dto[field] !== undefined) {
                data[field] = new client_1.Prisma.Decimal(dto[field]);
            }
        }
        if (dto.genderId !== undefined) {
            data.gender = dto.genderId ? { connect: { id: dto.genderId } } : { disconnect: true };
        }
        if (dto.preferredLanguageId !== undefined) {
            data.preferredLanguage = dto.preferredLanguageId ? { connect: { id: dto.preferredLanguageId } } : { disconnect: true };
        }
        if (dto.employmentStatusId !== undefined) {
            data.employmentStatus = dto.employmentStatusId ? { connect: { id: dto.employmentStatusId } } : { disconnect: true };
        }
        if (dto.occupationId !== undefined) {
            data.occupation = dto.occupationId ? { connect: { id: dto.occupationId } } : { disconnect: true };
        }
        if (dto.idTypeId !== undefined) {
            data.idType = dto.idTypeId ? { connect: { id: dto.idTypeId } } : { disconnect: true };
        }
        if (dto.idStateId !== undefined) {
            data.idState = dto.idStateId ? { connect: { id: dto.idStateId } } : { disconnect: true };
        }
        if (dto.salesPersonId !== undefined) {
            data.salesperson = dto.salesPersonId ? { connect: { id: dto.salesPersonId } } : { disconnect: true };
        }
        if (dto.bdcAgentId !== undefined) {
            data.bdcAgent = dto.bdcAgentId ? { connect: { id: dto.bdcAgentId } } : { disconnect: true };
        }
        const record = await this.buyer.update({
            where: { id },
            data,
            include: BUYER_INCLUDE,
        });
        if (tenantId === auth_1.PORTAL_TENANT_ID && record.email && !record.clerkUserId) {
            await this.linkClerkAccount(record.id, record.email, record.firstName, record.lastName);
            const updated = await this.buyer.findUnique({
                where: { id: record.id },
                include: BUYER_INCLUDE,
            });
            if (updated)
                return new buyer_entity_1.BuyerEntity(updated);
        }
        return new buyer_entity_1.BuyerEntity(record);
    }
    async remove(id, tenantId) {
        await this.ensureBuyerExists(id, tenantId);
        await this.buyer.delete({ where: { id } });
        return { message: `Buyer ${id} deleted` };
    }
    async removeBulk(ids, tenantId) {
        const buyers = await this.buyer.findMany({
            where: { id: { in: ids }, tenantId: tenantId || undefined },
            select: { id: true },
        });
        const foundIds = buyers.map((b) => b.id);
        const notFound = ids.filter((id) => !foundIds.includes(id));
        if (notFound.length > 0) {
            throw new common_1.NotFoundException(`Buyers not found or not accessible: ${notFound.join(', ')}`);
        }
        const result = await this.buyer.deleteMany({
            where: { id: { in: foundIds }, tenantId: tenantId || undefined },
        });
        return {
            message: `${result.count} customer(s) have been successfully deleted`,
            count: result.count,
        };
    }
    async linkClerkAccount(buyerId, email, firstName, lastName) {
        try {
            const password = (0, crypto_1.randomBytes)(GENERATED_PASSWORD_BYTES).toString('hex');
            const { clerkUserId } = await this.clerkService.createUser({
                email,
                password,
                firstName,
                lastName,
            });
            const conflict = await this.prisma.buyer.findUnique({
                where: { clerkUserId },
                select: { id: true },
            });
            if (conflict && conflict.id !== buyerId) {
                this.logger.warn(`Clerk account ${clerkUserId} (${email}) is already linked to buyer ${conflict.id} — skipping link for buyer ${buyerId}`);
                return;
            }
            await this.prisma.buyer.update({
                where: { id: buyerId },
                data: { clerkUserId },
            });
            this.logger.log(`Linked Clerk account ${clerkUserId} to buyer ${buyerId} (${email})`);
        }
        catch (err) {
            this.logger.warn(`Best-effort Clerk account creation failed for buyer ${buyerId} (${email}): ${err?.message ?? String(err)}`);
        }
    }
    async ensureBuyerExists(id, tenantId) {
        const exists = await this.buyer.findFirst({
            where: { id, tenantId: tenantId || undefined },
            select: { id: true },
        });
        if (!exists) {
            throw new common_1.NotFoundException(`Buyer ${id} not found`);
        }
    }
    async checkDuplicate(tenantId, email, phoneMain) {
        const normalizedPhone = phoneMain ? (0, common_2.normalizePhoneNumber)(phoneMain) : null;
        const [emailCheck, phoneCheck] = await Promise.all([
            email
                ? this.buyer.findFirst({
                    where: { tenantId, email },
                    select: { id: true },
                })
                : null,
            normalizedPhone
                ? this.buyer.findFirst({
                    where: { tenantId, phoneMain: normalizedPhone },
                    select: { id: true },
                })
                : null,
        ]);
        return {
            emailExists: !!emailCheck,
            phoneExists: !!phoneCheck,
        };
    }
};
exports.BuyersService = BuyersService;
exports.BuyersService = BuyersService = BuyersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        auth_1.ClerkService])
], BuyersService);
//# sourceMappingURL=buyers.service.js.map