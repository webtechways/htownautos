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
var AuditLogInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const audit_log_decorator_1 = require("../decorators/audit-log.decorator");
const prisma_1 = require("@htownautos/prisma");
const RESOURCE_MODEL_MAP = {
    'vehicle': 'vehicle',
    'buyer': 'buyer',
    'deal': 'deal',
    'extra-expense': 'extraExpense',
    'media': 'media',
    'meta': 'meta',
    'title': 'title',
};
const NOMENCLATOR_FIELD_MAP = {
    vehicleTypeId: { model: 'vehicleType', displayField: 'title' },
    bodyTypeId: { model: 'bodyType', displayField: 'title' },
    fuelTypeId: { model: 'fuelType', displayField: 'title' },
    driveTypeId: { model: 'driveType', displayField: 'title' },
    transmissionTypeId: { model: 'transmissionType', displayField: 'title' },
    vehicleConditionId: { model: 'vehicleCondition', displayField: 'title' },
    vehicleStatusId: { model: 'vehicleStatus', displayField: 'title' },
    sourceId: { model: 'vehicleSource', displayField: 'title' },
    titleBrandId: { model: 'titleBrand', displayField: 'title' },
    mileageUnitId: { model: 'mileageUnit', displayField: 'title' },
    yearId: { model: 'vehicleYear', displayField: 'year' },
    makeId: { model: 'vehicleMake', displayField: 'name' },
    modelId: { model: 'vehicleModel', displayField: 'name' },
    trimId: { model: 'vehicleTrim', displayField: 'name' },
    titleStatusId: { model: 'titleStatus', displayField: 'title' },
    brandStatusId: { model: 'brandStatus', displayField: 'title' },
};
const SUMMARY_FIELDS = {
    'vehicle': [
        'vin', 'stockNumber', 'status', 'color', 'mileage',
        'vehicleCost', 'askingPrice', 'msrp', 'wholesalePrice',
        'costPrice', 'listPrice', 'salePrice',
    ],
    'extra-expense': ['description', 'price', 'receipts', 'receiptIds'],
    'media': ['filename', 'mimeType', 'mediaType', 'category', 'url'],
    'meta': ['key', 'value'],
    'title': [
        'titleNumber', 'titleState', 'titleAppNumber',
    ],
};
let AuditLogInterceptor = AuditLogInterceptor_1 = class AuditLogInterceptor {
    reflector;
    prisma;
    logger = new common_1.Logger(AuditLogInterceptor_1.name);
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async intercept(context, next) {
        const metadata = this.reflector.get(audit_log_decorator_1.AUDIT_LOG_KEY, context.getHandler());
        if (!metadata) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || 'unknown';
        const tenantId = request.tenant?.id || headers['x-tenant-id'] || null;
        const startTime = Date.now();
        const { clerkUserId, tokenEmail } = this.extractUserFromToken(request);
        const resourceId = request.params?.id || request.body?.id || null;
        const resourceLower = metadata.resource.toLowerCase();
        const buyerId = request.params?.buyerId || request.body?.buyerId || request.query?.buyerId
            || (resourceLower === 'buyer' ? resourceId : null);
        const vehicleId = request.params?.vehicleId || request.body?.vehicleId || request.query?.vehicleId
            || (resourceLower === 'vehicle' ? resourceId : null);
        const dealId = request.params?.dealId || request.body?.dealId || request.query?.dealId
            || (resourceLower === 'deal' ? resourceId : null);
        let previousRecord = null;
        if (metadata.trackChanges && (metadata.action === 'update' || metadata.action === 'delete')) {
            try {
                const modelName = RESOURCE_MODEL_MAP[resourceLower] || resourceLower;
                const model = this.prisma.getModel(modelName);
                if (model) {
                    if (resourceId) {
                        const includeOpts = modelName === 'extraExpense' ? { include: { receipts: { select: { id: true } } } } : {};
                        previousRecord = await model.findUnique({ where: { id: resourceId }, ...includeOpts });
                        if (previousRecord?.receipts && Array.isArray(previousRecord.receipts)) {
                            previousRecord.receiptIds = previousRecord.receipts.map((r) => r.id);
                            delete previousRecord.receipts;
                        }
                    }
                    else if (resourceLower === 'title' && vehicleId) {
                        previousRecord = await model.findFirst({ where: { vehicleId } });
                    }
                }
            }
            catch (err) {
                this.logger.warn(`Failed to fetch previous record for change tracking: ${err.message}`);
            }
        }
        return next.handle().pipe((0, operators_1.tap)(async (responseData) => {
            const duration = Date.now() - startTime;
            const userId = request.user?.id || clerkUserId || 'anonymous';
            const userEmail = request.user?.email || tokenEmail || 'unknown';
            let finalResourceId = resourceId;
            let finalVehicleId = vehicleId;
            let finalBuyerId = buyerId;
            let finalDealId = dealId;
            if (metadata.action === 'create' && responseData?.id) {
                finalResourceId = finalResourceId || responseData.id;
                if (resourceLower === 'vehicle')
                    finalVehicleId = finalVehicleId || responseData.id;
                if (resourceLower === 'buyer')
                    finalBuyerId = finalBuyerId || responseData.id;
                if (resourceLower === 'deal')
                    finalDealId = finalDealId || responseData.id;
            }
            const refSource = previousRecord || responseData;
            if (refSource) {
                finalVehicleId = finalVehicleId || refSource.vehicleId || null;
                finalBuyerId = finalBuyerId || refSource.buyerId || null;
                finalDealId = finalDealId || refSource.dealId || null;
                if (refSource.entityType && refSource.entityId) {
                    const et = refSource.entityType.toLowerCase();
                    if (et === 'vehicle' && !finalVehicleId)
                        finalVehicleId = refSource.entityId;
                    if (et === 'buyer' && !finalBuyerId)
                        finalBuyerId = refSource.entityId;
                    if (et === 'deal' && !finalDealId)
                        finalDealId = refSource.entityId;
                }
            }
            this.logger.log(`[AUDIT] ${metadata.action.toUpperCase()} ${metadata.resource} - User: ${userEmail} (${userId}) - IP: ${ip}`);
            let changes = this.computeChanges(previousRecord, request.body, metadata);
            if (changes) {
                changes = await this.enrichMediaChanges(changes);
                changes = await this.enrichNomenclatorChanges(changes);
            }
            let createdData = metadata.action === 'create' && responseData
                ? this.extractSummary(responseData, metadata)
                : null;
            let deletedData = metadata.action === 'delete' && previousRecord
                ? this.extractSummary(previousRecord, metadata)
                : null;
            if (createdData?.receipts || createdData?.receiptIds) {
                createdData = await this.enrichReceiptSummary(createdData);
            }
            if (deletedData?.receipts || deletedData?.receiptIds) {
                deletedData = await this.enrichReceiptSummary(deletedData);
            }
            if (metadata.trackChanges && metadata.action === 'update' && !changes) {
                return;
            }
            await this.createAuditLog({
                userId,
                userEmail,
                clerkUserId,
                tenantId,
                action: metadata.action,
                resource: metadata.resource,
                resourceId: finalResourceId,
                buyerId: finalBuyerId,
                vehicleId: finalVehicleId,
                dealId: finalDealId,
                method,
                url,
                ipAddress: ip,
                userAgent,
                status: 'success',
                duration,
                level: metadata.level,
                pii: metadata.pii,
                compliance: metadata.compliance || [],
                metadata: {
                    params: request.params,
                    query: request.query,
                    bodyKeys: request.body ? Object.keys(request.body) : [],
                    changes,
                    createdData,
                    deletedData,
                },
            });
        }), (0, operators_1.catchError)(async (error) => {
            const duration = Date.now() - startTime;
            const userId = request.user?.id || clerkUserId || 'anonymous';
            const userEmail = request.user?.email || tokenEmail || 'unknown';
            this.logger.log(`[AUDIT] ${metadata.action.toUpperCase()} ${metadata.resource} - User: ${userEmail} (${userId}) - IP: ${ip} - FAILED`);
            await this.createAuditLog({
                userId,
                userEmail,
                clerkUserId,
                tenantId,
                action: metadata.action,
                resource: metadata.resource,
                resourceId,
                buyerId,
                vehicleId,
                dealId,
                method,
                url,
                ipAddress: ip,
                userAgent,
                status: 'failure',
                duration,
                level: metadata.level,
                pii: metadata.pii,
                compliance: metadata.compliance || [],
                errorMessage: error.message,
                errorCode: error.status || 500,
                metadata: {
                    params: request.params,
                    query: request.query,
                    bodyKeys: request.body ? Object.keys(request.body) : [],
                },
            });
            throw error;
        }));
    }
    extractUserFromToken(request) {
        let clerkUserId = null;
        let tokenEmail = null;
        try {
            const authHeader = request.headers.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                const accessToken = authHeader.substring(7);
                const accessPayload = this.decodeJwtPayload(accessToken);
                if (accessPayload) {
                    clerkUserId = accessPayload.sub || null;
                }
            }
            const idToken = request.headers['x-id-token'];
            if (idToken) {
                const idPayload = this.decodeJwtPayload(idToken);
                if (idPayload) {
                    tokenEmail = idPayload.email || null;
                }
            }
            return { clerkUserId, tokenEmail };
        }
        catch {
            return { clerkUserId: null, tokenEmail: null };
        }
    }
    decodeJwtPayload(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }
            return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        }
        catch {
            return null;
        }
    }
    computeChanges(previousRecord, body, metadata) {
        if (!previousRecord || !body)
            return null;
        const changes = {};
        const bodyKeys = Object.keys(body);
        const skipFields = new Set(['id', 'createdAt', 'updatedAt', 'tenantId']);
        for (const key of bodyKeys) {
            if (skipFields.has(key))
                continue;
            const oldVal = previousRecord[key];
            const newVal = body[key];
            if (newVal === undefined)
                continue;
            const normalize = (v) => {
                if (v === null || v === undefined)
                    return 'null';
                if (v instanceof Date)
                    return v.toISOString().split('T')[0];
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}(T|$)/.test(v))
                    return v.split('T')[0];
                return v.toString?.() ?? String(v);
            };
            const oldStr = normalize(oldVal);
            const newStr = normalize(newVal);
            if (oldStr !== newStr) {
                if (metadata.pii) {
                    changes[key] = { old: '[REDACTED]', new: '[REDACTED]' };
                }
                else {
                    changes[key] = { old: oldVal ?? null, new: newVal };
                }
            }
        }
        return Object.keys(changes).length > 0 ? changes : null;
    }
    async enrichMediaChanges(changes) {
        const mediaModel = this.prisma.getModel('media');
        if (!mediaModel)
            return changes;
        const enriched = { ...changes };
        for (const [field, diff] of Object.entries(enriched)) {
            if (field === 'receiptIds') {
                try {
                    const oldIds = Array.isArray(diff.old) ? diff.old : [];
                    const newIds = Array.isArray(diff.new) ? diff.new : [];
                    const oldSet = new Set(oldIds);
                    const newSet = new Set(newIds);
                    const addedIds = newIds.filter((id) => !oldSet.has(id));
                    const removedIds = oldIds.filter((id) => !newSet.has(id));
                    const allIds = [...new Set([...addedIds, ...removedIds])];
                    const mediaRecords = allIds.length > 0
                        ? await mediaModel.findMany({
                            where: { id: { in: allIds } },
                            select: { id: true, url: true },
                        })
                        : [];
                    const urlMap = new Map(mediaRecords.map((m) => [m.id, m.url]));
                    const added = addedIds.map((id) => urlMap.get(id) || id);
                    const removed = removedIds.map((id) => urlMap.get(id) || id);
                    enriched['receipts'] = { old: removed, new: added };
                    delete enriched[field];
                }
                catch (err) {
                    this.logger.warn(`Failed to enrich receiptIds: ${err.message}`);
                }
                continue;
            }
            if (!field.endsWith('ImageId'))
                continue;
            try {
                const [oldMedia, newMedia] = await Promise.all([
                    diff.old ? mediaModel.findUnique({ where: { id: diff.old }, select: { url: true } }) : null,
                    diff.new ? mediaModel.findUnique({ where: { id: diff.new }, select: { url: true } }) : null,
                ]);
                const displayField = field.replace(/Id$/, '');
                enriched[displayField] = {
                    old: oldMedia?.url ?? diff.old,
                    new: newMedia?.url ?? diff.new,
                };
                delete enriched[field];
            }
            catch (err) {
                this.logger.warn(`Failed to enrich media field ${field}: ${err.message}`);
            }
        }
        return enriched;
    }
    async enrichReceiptSummary(summary) {
        if (Array.isArray(summary.receipts) && summary.receipts.length > 0) {
            summary.receiptIds = summary.receipts.map((r) => r.url || r.id || r);
            delete summary.receipts;
            return summary;
        }
        delete summary.receipts;
        const ids = Array.isArray(summary.receiptIds) ? summary.receiptIds : [];
        if (ids.length === 0) {
            delete summary.receiptIds;
            return summary;
        }
        try {
            const mediaModel = this.prisma.getModel('media');
            const records = await mediaModel.findMany({
                where: { id: { in: ids } },
                select: { id: true, url: true },
            });
            const urlMap = new Map(records.map((m) => [m.id, m.url]));
            summary.receiptIds = ids.map((id) => urlMap.get(id) || id);
        }
        catch (err) {
            this.logger.warn(`Failed to enrich receiptIds in summary: ${err.message}`);
        }
        return summary;
    }
    async enrichNomenclatorChanges(changes) {
        const enriched = { ...changes };
        for (const [field, diff] of Object.entries(enriched)) {
            const mapping = NOMENCLATOR_FIELD_MAP[field];
            if (!mapping)
                continue;
            const model = this.prisma.getModel(mapping.model);
            if (!model)
                continue;
            try {
                const [oldRecord, newRecord] = await Promise.all([
                    diff.old ? model.findUnique({ where: { id: diff.old }, select: { [mapping.displayField]: true } }) : null,
                    diff.new ? model.findUnique({ where: { id: diff.new }, select: { [mapping.displayField]: true } }) : null,
                ]);
                const displayField = field.replace(/Id$/, '');
                enriched[displayField] = {
                    old: oldRecord?.[mapping.displayField] ?? diff.old,
                    new: newRecord?.[mapping.displayField] ?? diff.new,
                };
                delete enriched[field];
            }
            catch (err) {
                this.logger.warn(`Failed to enrich nomenclator field ${field}: ${err.message}`);
            }
        }
        return enriched;
    }
    extractSummary(record, metadata) {
        if (!record || typeof record !== 'object')
            return null;
        let plain;
        try {
            plain = JSON.parse(JSON.stringify(record));
        }
        catch {
            return null;
        }
        const resourceLower = metadata.resource.toLowerCase();
        const whitelist = SUMMARY_FIELDS[resourceLower];
        const skipFields = new Set([
            'id', 'createdAt', 'updatedAt', 'tenantId',
            'password', 'hash', 'token', 'secret',
            'vehicleId', 'buyerId', 'dealId',
        ]);
        const summary = {};
        for (const [key, value] of Object.entries(plain)) {
            if (whitelist) {
                if (!whitelist.includes(key))
                    continue;
            }
            else {
                if (skipFields.has(key))
                    continue;
            }
            if (value === null || value === undefined)
                continue;
            if (typeof value === 'object' && !Array.isArray(value))
                continue;
            if (metadata.pii) {
                summary[key] = '[REDACTED]';
            }
            else {
                summary[key] = value;
            }
        }
        return Object.keys(summary).length > 0 ? summary : null;
    }
    async createAuditLog(data) {
        try {
            await this.prisma.getModel('auditLog').create({
                data: {
                    userId: data.userId,
                    userEmail: data.userEmail,
                    tenantId: data.tenantId,
                    action: data.action,
                    resource: data.resource,
                    resourceId: data.resourceId,
                    buyerId: data.buyerId,
                    vehicleId: data.vehicleId,
                    dealId: data.dealId,
                    method: data.method,
                    url: data.url,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    status: data.status,
                    duration: data.duration,
                    level: data.level,
                    pii: data.pii,
                    compliance: data.compliance,
                    errorMessage: data.errorMessage,
                    errorCode: data.errorCode,
                    metadata: data.metadata,
                },
            });
            if (data.level === 'critical' || data.pii) {
                this.logger.warn(`[CRITICAL-AUDIT] ${data.action.toUpperCase()} ${data.resource} - ` +
                    `User: ${data.userEmail} (${data.clerkUserId}) - Resource: ${data.resourceId} - ` +
                    `Status: ${data.status} - PII: ${data.pii} - ` +
                    `Compliance: ${data.compliance.join(', ')}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
        }
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = AuditLogInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_1.PrismaService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map