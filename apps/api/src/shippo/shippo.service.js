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
var ShippoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPS_STATIC_TEMPLATES = exports.ShippoService = void 0;
const common_1 = require("@nestjs/common");
const shippo_1 = require("shippo");
function toSdkParcel(p) {
    return {
        length: String(p.length),
        width: String(p.width),
        height: String(p.height),
        distanceUnit: p.distance_unit,
        weight: String(p.weight),
        massUnit: p.mass_unit,
    };
}
let ShippoService = ShippoService_1 = class ShippoService {
    logger = new common_1.Logger(ShippoService_1.name);
    client;
    constructor() {
        const apiKey = process.env.SHIPPO_TOKEN;
        if (!apiKey) {
            this.logger.warn('SHIPPO_TOKEN not set — Shippo integration disabled');
        }
        this.client = new shippo_1.Shippo({
            apiKeyHeader: apiKey || 'missing',
            shippoApiVersion: '2018-02-08',
        });
    }
    get sdk() {
        return this.client;
    }
    async safeCall(op, fn) {
        try {
            return await fn();
        }
        catch (err) {
            const status = err?.statusCode;
            const body = err?.body;
            if (status && status >= 200 && status < 300 && body) {
                try {
                    const parsed = JSON.parse(body);
                    this.logger.warn(`Shippo SDK threw on ${status} for ${op} — using parsed body.`);
                    return parsed;
                }
                catch {
                }
            }
            this.logger.error(`Shippo ${op} failed: ${err.message} | status=${status} body=${body}`);
            throw new common_1.BadRequestException(`Shippo ${op} error: ${err.message}`);
        }
    }
    listAddresses(page, results) {
        return this.safeCall('addresses.list', () => this.client.addresses.list(page, results));
    }
    getAddress(addressId) {
        return this.safeCall('addresses.get', () => this.client.addresses.get(addressId));
    }
    createAddress(payload) {
        return this.safeCall('addresses.create', () => this.client.addresses.create(payload));
    }
    validateAddressById(addressId) {
        return this.safeCall('addresses.validate', () => this.client.addresses.validate(addressId));
    }
    async validateAddress(input) {
        const payload = {
            name: input.name,
            company: input.company,
            street1: input.street1,
            ...(input.street2 && { street2: input.street2 }),
            city: input.city,
            state: input.state,
            zip: input.zip,
            country: input.country || 'US',
            ...(input.phone && { phone: input.phone }),
            ...(input.email && { email: input.email }),
            validate: true,
        };
        this.logger.log(`Shippo addresses.create (validate=true) request: ${JSON.stringify(payload)}`);
        try {
            const response = await this.client.addresses.create(payload);
            return this.formatValidation(input, response);
        }
        catch (err) {
            const status = err?.statusCode;
            const body = err?.body;
            if (status && status >= 200 && status < 300 && body) {
                try {
                    const parsed = JSON.parse(body);
                    return this.formatValidation(input, parsed);
                }
                catch {
                }
            }
            this.logger.error(`Shippo validateAddress failed: ${err.message} | status=${status} body=${body}`);
            throw new common_1.BadRequestException(`Address validation failed: ${err.message}`);
        }
    }
    formatValidation(input, response) {
        const validationResults = response?.validationResults ?? response?.validation_results ?? {};
        const rawIsValid = validationResults?.isValid ?? validationResults?.is_valid;
        const isValid = rawIsValid === true;
        const messages = (validationResults?.messages || []).map((m) => ({
            code: m.code,
            source: m.source,
            text: m.text,
        }));
        const suggested = {
            name: response?.name ?? input.name,
            company: response?.company ?? input.company,
            street1: response?.street1 ?? input.street1,
            street2: response?.street2 ?? input.street2 ?? '',
            city: response?.city ?? input.city,
            state: response?.state ?? input.state,
            zip: response?.zip ?? input.zip,
            country: response?.country ?? input.country ?? 'US',
            phone: response?.phone ?? input.phone,
            email: response?.email ?? input.email,
        };
        const norm = (s) => String(s ?? '').trim().toUpperCase();
        const hasSuggestion = norm(suggested.street1) !== norm(input.street1) ||
            norm(suggested.street2) !== norm(input.street2 ?? '') ||
            norm(suggested.city) !== norm(input.city) ||
            norm(suggested.state) !== norm(input.state) ||
            norm(suggested.zip) !== norm(input.zip);
        return { isValid, hasSuggestion, messages, original: input, suggested };
    }
    listParcels(page, results) {
        return this.safeCall('parcels.list', () => this.client.parcels.list(page, results));
    }
    getParcel(parcelId) {
        return this.safeCall('parcels.get', () => this.client.parcels.get(parcelId));
    }
    createParcel(payload) {
        return this.safeCall('parcels.create', () => this.client.parcels.create(payload));
    }
    listShipments(query = {}) {
        return this.safeCall('shipments.list', () => this.client.shipments.list(query));
    }
    getShipment(shipmentId) {
        return this.safeCall('shipments.get', () => this.client.shipments.get(shipmentId));
    }
    async createShipment(params) {
        try {
            const request = {
                addressFrom: params.addressFrom,
                addressTo: params.addressTo,
                parcels: [toSdkParcel(params.parcel)],
                async: false,
            };
            if (params.carrierAccounts)
                request.carrierAccounts = params.carrierAccounts;
            if (params.metadata)
                request.metadata = params.metadata;
            if (params.shipmentDate)
                request.shipmentDate = params.shipmentDate;
            if (params.customsDeclaration)
                request.customsDeclaration = params.customsDeclaration;
            if (params.extra)
                request.extra = params.extra;
            return await this.client.shipments.create(request);
        }
        catch (err) {
            this.logger.error(`Shippo createShipment failed: ${err.message}`);
            throw new common_1.BadRequestException(`Shippo error: ${err.message}`);
        }
    }
    createShipmentRaw(request) {
        return this.safeCall('shipments.createRaw', () => this.client.shipments.create({ async: false, ...request }));
    }
    async getUpsRates(shipmentId) {
        try {
            const shipment = await this.client.shipments.get(shipmentId);
            const rates = shipment.rates || [];
            return rates.filter((r) => r.provider?.toLowerCase() === 'ups' ||
                r.providerImage75?.toLowerCase().includes('ups'));
        }
        catch (err) {
            this.logger.error(`Shippo getUpsRates failed: ${err.message}`);
            throw new common_1.BadRequestException(`Shippo error: ${err.message}`);
        }
    }
    getRate(rateId) {
        return this.safeCall('rates.get', () => this.client.rates.get(rateId));
    }
    listShipmentRates(shipmentId, page, results) {
        return this.safeCall('rates.listShipmentRates', () => this.client.rates.listShipmentRates(shipmentId, page, results));
    }
    listShipmentRatesByCurrencyCode(shipmentId, currencyCode, page, results) {
        return this.safeCall('rates.listShipmentRatesByCurrencyCode', () => this.client.rates.listShipmentRatesByCurrencyCode({
            shipmentId,
            currencyCode,
            page,
            results,
        }));
    }
    listTransactions(query = {}) {
        return this.safeCall('transactions.list', () => this.client.transactions.list(query));
    }
    getTransaction(transactionId) {
        return this.safeCall('transactions.get', () => this.client.transactions.get(transactionId));
    }
    async buyLabel(rateId, labelFileType = 'PDF') {
        try {
            const transaction = await this.client.transactions.create({
                rate: rateId,
                labelFileType: labelFileType,
                async: false,
            });
            if (transaction.status !== 'SUCCESS') {
                const messages = (transaction.messages || []).map((m) => m.text).join('; ');
                throw new common_1.BadRequestException(`Shippo label purchase failed: ${messages}`);
            }
            return transaction;
        }
        catch (err) {
            this.logger.error(`Shippo buyLabel failed: ${err.message}`);
            if (err instanceof common_1.BadRequestException)
                throw err;
            throw new common_1.InternalServerErrorException(`Shippo error: ${err.message}`);
        }
    }
    createTransaction(request) {
        return this.safeCall('transactions.create', () => this.client.transactions.create({ async: false, ...request }));
    }
    registerTracking(carrier, trackingNumber, metadata) {
        return this.safeCall('tracks.create', () => this.client.trackingStatus.create({
            carrier,
            trackingNumber,
            ...(metadata && { metadata }),
        }));
    }
    async getTracking(carrier, trackingNumber) {
        try {
            return await this.client.trackingStatus.get(trackingNumber, carrier);
        }
        catch (err) {
            this.logger.error(`Shippo getTracking failed: ${err.message}`);
            return null;
        }
    }
    listRefunds(query = {}) {
        return this.safeCall('refunds.list', () => this.client.refunds.list(query));
    }
    getRefund(refundId) {
        return this.safeCall('refunds.get', () => this.client.refunds.get(refundId));
    }
    async refundLabel(transactionId) {
        try {
            return await this.client.refunds.create({ transaction: transactionId, async: false });
        }
        catch (err) {
            this.logger.error(`Shippo refundLabel failed: ${err.message}`);
            throw new common_1.BadRequestException(`Shippo refund error: ${err.message}`);
        }
    }
    listCarrierAccounts(query = {}) {
        return this.safeCall('carrierAccounts.list', () => this.client.carrierAccounts.list(query));
    }
    getCarrierAccount(id) {
        return this.safeCall('carrierAccounts.get', () => this.client.carrierAccounts.get(id));
    }
    createCarrierAccount(payload) {
        return this.safeCall('carrierAccounts.create', () => this.client.carrierAccounts.create(payload));
    }
    updateCarrierAccount(id, payload) {
        return this.safeCall('carrierAccounts.update', () => this.client.carrierAccounts.update(id, payload));
    }
    initiateOauth2Signin(carrierAccountId, redirectUri, state) {
        return this.safeCall('carrierAccounts.initiateOauth2Signin', () => this.client.carrierAccounts.initiateOauth2Signin(carrierAccountId, redirectUri, state));
    }
    registerCarrierAccount(payload) {
        return this.safeCall('carrierAccounts.register', () => this.client.carrierAccounts.register(payload));
    }
    getRegistrationStatus(carrier) {
        return this.safeCall('carrierAccounts.getRegistrationStatus', () => this.client.carrierAccounts.getRegistrationStatus(carrier));
    }
    listCarrierParcelTemplates(carrier, include = 'all') {
        return this.safeCall('carrierParcelTemplates.list', () => this.client.carrierParcelTemplates.list(include, carrier));
    }
    getCarrierParcelTemplate(token) {
        return this.safeCall('carrierParcelTemplates.get', () => this.client.carrierParcelTemplates.get(token));
    }
    async listUpsCarrierParcelTemplates() {
        return this.listSupportedCarrierParcelTemplates();
    }
    async listSupportedCarrierParcelTemplates() {
        const wanted = ['ups', 'fedex'];
        const out = [];
        for (const carrier of wanted) {
            try {
                const response = await this.client.carrierParcelTemplates.list('all', carrier);
                const results = response?.results || response;
                if (!Array.isArray(results))
                    continue;
                const matches = results.filter((t) => {
                    const token = String(t.token ?? '').toLowerCase();
                    const name = String(t.name ?? '').toLowerCase();
                    const tCarrier = String(t.carrier ?? '').toLowerCase();
                    return (tCarrier === carrier ||
                        token.startsWith(`${carrier}_`) ||
                        name.startsWith(`${carrier} `));
                });
                for (const t of matches) {
                    out.push({
                        token: t.token,
                        name: t.name,
                        length: Number(t.length),
                        width: Number(t.width),
                        height: Number(t.height),
                        distance_unit: t.distanceUnit || 'in',
                        carrier,
                    });
                }
            }
            catch (err) {
                this.logger.warn(`Shippo carrierParcelTemplates.list for ${carrier} failed: ${err.message}`);
            }
        }
        if (out.length === 0) {
            return exports.UPS_STATIC_TEMPLATES.map((t) => ({ ...t, carrier: 'ups' }));
        }
        return out;
    }
    listUserParcelTemplates() {
        return this.safeCall('userParcelTemplates.list', () => this.client.userParcelTemplates.list());
    }
    getUserParcelTemplate(id) {
        return this.safeCall('userParcelTemplates.get', () => this.client.userParcelTemplates.get(id));
    }
    async createUserParcelTemplate(params) {
        const hasWeight = params.weight !== undefined && params.weight !== null && Number(params.weight) > 0;
        const request = {
            name: params.name,
            length: String(params.length),
            width: String(params.width),
            height: String(params.height),
            distanceUnit: params.distanceUnit,
        };
        if (hasWeight) {
            request.weight = String(params.weight);
            request.weightUnit = params.weightUnit || 'lb';
        }
        try {
            const response = await this.client.userParcelTemplates.create(request);
            return response;
        }
        catch (err) {
            const status = err?.statusCode;
            const body = err?.body;
            if (status && status >= 200 && status < 300 && body) {
                try {
                    const parsed = JSON.parse(body);
                    return {
                        ...parsed,
                        objectId: parsed.object_id ?? parsed.objectId,
                        objectOwner: parsed.object_owner ?? parsed.objectOwner,
                        objectCreated: parsed.object_created ?? parsed.objectCreated,
                        objectUpdated: parsed.object_updated ?? parsed.objectUpdated,
                    };
                }
                catch (parseErr) {
                    this.logger.error(`Failed to parse Shippo success body: ${parseErr}`);
                }
            }
            this.logger.error(`Shippo userParcelTemplates.create failed: ${err.message} | status=${status} body=${body}`);
            throw err;
        }
    }
    async updateUserParcelTemplate(objectId, params) {
        const hasWeight = params.weight !== undefined && params.weight !== null && Number(params.weight) > 0;
        const request = {
            name: params.name,
            length: String(params.length),
            width: String(params.width),
            height: String(params.height),
            distanceUnit: params.distanceUnit,
        };
        if (hasWeight) {
            request.weight = String(params.weight);
            request.weightUnit = params.weightUnit || 'lb';
        }
        try {
            const response = await this.client.userParcelTemplates.update(objectId, request);
            return response;
        }
        catch (err) {
            const status = err?.statusCode;
            const body = err?.body;
            if (status && status >= 200 && status < 300 && body) {
                try {
                    const parsed = JSON.parse(body);
                    return { ...parsed, objectId: parsed.object_id ?? parsed.objectId };
                }
                catch {
                }
            }
            this.logger.error(`Shippo userParcelTemplates.update failed for ${objectId}: ${err.message} | status=${status} body=${body}`);
            throw err;
        }
    }
    async deleteUserParcelTemplate(objectId) {
        try {
            return await this.client.userParcelTemplates.delete(objectId);
        }
        catch (err) {
            const status = err?.statusCode ?? err?.rawResponse?.status ?? 'unknown';
            this.logger.error(`Shippo userParcelTemplates.delete failed for ${objectId}: ${err.message} | status=${status}`);
            throw err;
        }
    }
    listCustomsItems(page, results) {
        return this.safeCall('customsItems.list', () => this.client.customsItems.list(page, results));
    }
    getCustomsItem(id) {
        return this.safeCall('customsItems.get', () => this.client.customsItems.get(id));
    }
    createCustomsItem(payload) {
        return this.safeCall('customsItems.create', () => this.client.customsItems.create(payload));
    }
    listCustomsDeclarations(page, results) {
        return this.safeCall('customsDeclarations.list', () => this.client.customsDeclarations.list(page, results));
    }
    getCustomsDeclaration(id) {
        return this.safeCall('customsDeclarations.get', () => this.client.customsDeclarations.get(id));
    }
    createCustomsDeclaration(payload) {
        return this.safeCall('customsDeclarations.create', () => this.client.customsDeclarations.create(payload));
    }
    listManifests(page, results) {
        return this.safeCall('manifests.list', () => this.client.manifests.list(page, results));
    }
    getManifest(id) {
        return this.safeCall('manifests.get', () => this.client.manifests.get(id));
    }
    createManifest(payload) {
        return this.safeCall('manifests.create', () => this.client.manifests.create(payload));
    }
    listOrders(query = {}) {
        return this.safeCall('orders.list', () => this.client.orders.list(query));
    }
    getOrder(id) {
        return this.safeCall('orders.get', () => this.client.orders.get(id));
    }
    createOrder(payload) {
        return this.safeCall('orders.create', () => this.client.orders.create(payload));
    }
    createPickup(payload) {
        return this.safeCall('pickups.create', () => this.client.pickups.create(payload));
    }
    listServiceGroups(query = {}) {
        return this.safeCall('serviceGroups.list', () => this.client.serviceGroups.list(query));
    }
    createServiceGroup(payload) {
        return this.safeCall('serviceGroups.create', () => this.client.serviceGroups.create(payload));
    }
    updateServiceGroup(payload) {
        return this.safeCall('serviceGroups.update', () => this.client.serviceGroups.update(payload));
    }
    deleteServiceGroup(id) {
        return this.safeCall('serviceGroups.delete', () => this.client.serviceGroups.delete(id));
    }
    createBatch(payload) {
        return this.safeCall('batches.create', () => this.client.batches.create(payload));
    }
    getBatch(id, page, results) {
        return this.safeCall('batches.get', () => this.client.batches.get(id, page, results));
    }
    addShipmentsToBatch(batchId, shipments) {
        return this.safeCall('batches.addShipments', () => this.client.batches.addShipments(shipments, batchId));
    }
    removeShipmentsFromBatch(batchId, shipmentIds) {
        return this.safeCall('batches.removeShipments', () => this.client.batches.removeShipments(shipmentIds, batchId));
    }
    purchaseBatch(batchId) {
        return this.safeCall('batches.purchase', () => this.client.batches.purchase(batchId));
    }
    createLiveRates(payload) {
        return this.safeCall('ratesAtCheckout.create', () => this.client.ratesAtCheckout.create(payload));
    }
    getDefaultParcelTemplate() {
        return this.safeCall('ratesAtCheckout.getDefaultParcelTemplate', () => this.client.ratesAtCheckout.getDefaultParcelTemplate({}));
    }
    updateDefaultParcelTemplate(payload) {
        return this.safeCall('ratesAtCheckout.updateDefaultParcelTemplate', () => this.client.ratesAtCheckout.updateDefaultParcelTemplate(payload));
    }
    deleteDefaultParcelTemplate() {
        return this.safeCall('ratesAtCheckout.deleteDefaultParcelTemplate', () => this.client.ratesAtCheckout.deleteDefaultParcelTemplate({}));
    }
    listWebhooks() {
        return this.safeCall('webhooks.list', () => this.client.webhooks.listWebhooks());
    }
    getWebhook(id) {
        return this.safeCall('webhooks.get', () => this.client.webhooks.getWebhook(id));
    }
    createWebhook(payload) {
        const sdkPayload = {
            url: payload.url,
            event: payload.event ?? payload.eventType,
            active: payload.active ?? payload.isActive,
        };
        if (payload.isTest !== undefined)
            sdkPayload.isTest = payload.isTest;
        return this.safeCall('webhooks.create', () => this.client.webhooks.createWebhook(sdkPayload));
    }
    updateWebhook(id, payload) {
        const sdkPayload = { ...payload };
        if (sdkPayload.eventType && !sdkPayload.event)
            sdkPayload.event = sdkPayload.eventType;
        if (sdkPayload.isActive !== undefined && sdkPayload.active === undefined)
            sdkPayload.active = sdkPayload.isActive;
        delete sdkPayload.eventType;
        delete sdkPayload.isActive;
        return this.safeCall('webhooks.update', () => this.client.webhooks.updateWebhook(sdkPayload, id));
    }
    deleteWebhook(id) {
        return this.safeCall('webhooks.delete', () => this.client.webhooks.deleteWebhook(id));
    }
    verifyWebhookSignature(rawBody, signatureHeader) {
        const secret = process.env.SHIPPO_WEBHOOK_SECRET;
        if (!secret) {
            this.logger.warn('SHIPPO_WEBHOOK_SECRET not set — rejecting webhook');
            return false;
        }
        if (!signatureHeader)
            return false;
        const parts = signatureHeader.split(',').reduce((acc, chunk) => {
            const [k, v] = chunk.split('=');
            if (k && v)
                acc[k.trim()] = v.trim();
            return acc;
        }, {});
        const timestamp = parts['t'];
        const signature = parts['v1'];
        if (!timestamp || !signature)
            return false;
        const body = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
        const signedPayload = `${timestamp}.${body}`;
        const crypto = require('crypto');
        const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
        try {
            return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
        }
        catch {
            return false;
        }
    }
};
exports.ShippoService = ShippoService;
exports.ShippoService = ShippoService = ShippoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ShippoService);
exports.UPS_STATIC_TEMPLATES = [
    { token: 'UPS_Express_Box_Small', name: 'UPS Express Box Small', length: 13, width: 11, height: 2, distance_unit: 'in' },
    { token: 'UPS_Express_Box_Medium', name: 'UPS Express Box Medium', length: 15, width: 11, height: 3, distance_unit: 'in' },
    { token: 'UPS_Express_Box_Large', name: 'UPS Express Box Large', length: 18, width: 13, height: 3, distance_unit: 'in' },
    { token: 'UPS_Express_Tube', name: 'UPS Express Tube', length: 38, width: 6, height: 6, distance_unit: 'in' },
    { token: 'UPS_Express_Pak', name: 'UPS Express Pak', length: 16, width: 12.75, height: 2, distance_unit: 'in' },
    { token: 'UPS_Laboratory_Pak', name: 'UPS Laboratory Pak', length: 17.5, width: 14.5, height: 2, distance_unit: 'in' },
    { token: 'UPS_Legal_Flat_Rate_Envelope', name: 'UPS Legal Flat Rate Envelope', length: 15, width: 9.5, height: 0.5, distance_unit: 'in' },
    { token: 'UPS_Padded_Pak', name: 'UPS Padded Pak', length: 14.75, width: 11, height: 2, distance_unit: 'in' },
];
//# sourceMappingURL=shippo.service.js.map