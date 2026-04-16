import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Shippo } from 'shippo';

export interface ShippoAddressDto {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
  company?: string;
}

export interface ShippoParcelDto {
  length: number;
  width: number;
  height: number;
  distance_unit: 'in' | 'cm';
  weight: number;
  mass_unit: 'lb' | 'kg' | 'oz' | 'g';
}

function toSdkParcel(p: ShippoParcelDto): any {
  // Shippo SDK (API 2018-02-08) validates parcel dimensions as strings.
  return {
    length: String(p.length),
    width: String(p.width),
    height: String(p.height),
    distanceUnit: p.distance_unit,
    weight: String(p.weight),
    massUnit: p.mass_unit,
  };
}

@Injectable()
export class ShippoService {
  private readonly logger = new Logger(ShippoService.name);
  private client: Shippo;

  constructor() {
    const apiKey = process.env.SHIPPO_TOKEN;
    if (!apiKey) {
      this.logger.warn('SHIPPO_TOKEN not set — Shippo integration disabled');
    }
    this.client = new Shippo({
      apiKeyHeader: apiKey || 'missing',
      shippoApiVersion: '2018-02-08',
    });
  }

  /** Access raw SDK client for callers that need unusual methods. */
  get sdk(): Shippo {
    return this.client;
  }

  // ──────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────

  /**
   * The Shippo JS SDK sometimes throws on 2xx responses with the message
   * "Unexpected Status or Content-Type". Caller-wrap known-safe ops with this
   * helper so we parse the body and treat it as success.
   */
  private async safeCall<T>(op: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const status: number | undefined = err?.statusCode;
      const body: string | undefined = err?.body;
      if (status && status >= 200 && status < 300 && body) {
        try {
          const parsed = JSON.parse(body);
          this.logger.warn(`Shippo SDK threw on ${status} for ${op} — using parsed body.`);
          return parsed as T;
        } catch {
          /* fall through */
        }
      }
      this.logger.error(`Shippo ${op} failed: ${err.message} | status=${status} body=${body}`);
      throw new BadRequestException(`Shippo ${op} error: ${err.message}`);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Addresses
  // ──────────────────────────────────────────────────────────────

  listAddresses(page?: number, results?: number) {
    return this.safeCall('addresses.list', () => (this.client as any).addresses.list(page, results));
  }
  getAddress(addressId: string) {
    return this.safeCall('addresses.get', () => this.client.addresses.get(addressId));
  }
  createAddress(payload: Record<string, unknown>) {
    return this.safeCall('addresses.create', () => (this.client as any).addresses.create(payload));
  }
  /** Validate an existing address by id (vs. validateAddress which creates+validates in one call) */
  validateAddressById(addressId: string) {
    return this.safeCall('addresses.validate', () => (this.client as any).addresses.validate(addressId));
  }

  /**
   * Validate an address with Shippo. Creates the address with validate=true so Shippo returns
   * both a validation result and a normalized/suggested version.
   */
  async validateAddress(input: {
    name?: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    phone?: string;
    email?: string;
  }) {
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
      const response: any = await (this.client as any).addresses.create(payload);
      return this.formatValidation(input, response);
    } catch (err: any) {
      const status: number | undefined = err?.statusCode;
      const body: string | undefined = err?.body;
      if (status && status >= 200 && status < 300 && body) {
        try {
          const parsed = JSON.parse(body);
          return this.formatValidation(input, parsed);
        } catch {
          /* fall through */
        }
      }
      this.logger.error(`Shippo validateAddress failed: ${err.message} | status=${status} body=${body}`);
      throw new BadRequestException(`Address validation failed: ${err.message}`);
    }
  }

  private formatValidation(input: any, response: any) {
    const validationResults = response?.validationResults ?? response?.validation_results ?? {};
    const rawIsValid = validationResults?.isValid ?? validationResults?.is_valid;
    const isValid: boolean = rawIsValid === true;
    const messages = (validationResults?.messages || []).map((m: any) => ({
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

    const norm = (s: any) => String(s ?? '').trim().toUpperCase();
    const hasSuggestion =
      norm(suggested.street1) !== norm(input.street1) ||
      norm(suggested.street2) !== norm(input.street2 ?? '') ||
      norm(suggested.city) !== norm(input.city) ||
      norm(suggested.state) !== norm(input.state) ||
      norm(suggested.zip) !== norm(input.zip);

    return { isValid, hasSuggestion, messages, original: input, suggested };
  }

  // ──────────────────────────────────────────────────────────────
  // Parcels
  // ──────────────────────────────────────────────────────────────

  listParcels(page?: number, results?: number) {
    return this.safeCall('parcels.list', () => (this.client as any).parcels.list(page, results));
  }
  getParcel(parcelId: string) {
    return this.safeCall('parcels.get', () => this.client.parcels.get(parcelId));
  }
  createParcel(payload: Record<string, unknown>) {
    return this.safeCall('parcels.create', () => (this.client as any).parcels.create(payload));
  }

  // ──────────────────────────────────────────────────────────────
  // Shipments
  // ──────────────────────────────────────────────────────────────

  listShipments(query: { page?: number; results?: number; objectCreatedGte?: string; objectCreatedLte?: string } = {}) {
    return this.safeCall('shipments.list', () => (this.client as any).shipments.list(query));
  }

  getShipment(shipmentId: string) {
    return this.safeCall('shipments.get', () => this.client.shipments.get(shipmentId));
  }

  async createShipment(params: {
    addressFrom: ShippoAddressDto;
    addressTo: ShippoAddressDto;
    parcel: ShippoParcelDto;
    carrierAccounts?: string[];
    metadata?: string;
    shipmentDate?: string;
    customsDeclaration?: string | Record<string, unknown>;
    extra?: Record<string, unknown>;
  }) {
    try {
      const request: any = {
        addressFrom: params.addressFrom,
        addressTo: params.addressTo,
        parcels: [toSdkParcel(params.parcel)],
        async: false,
      };
      if (params.carrierAccounts) request.carrierAccounts = params.carrierAccounts;
      if (params.metadata) request.metadata = params.metadata;
      if (params.shipmentDate) request.shipmentDate = params.shipmentDate;
      if (params.customsDeclaration) request.customsDeclaration = params.customsDeclaration;
      if (params.extra) request.extra = params.extra;
      return await this.client.shipments.create(request);
    } catch (err: any) {
      this.logger.error(`Shippo createShipment failed: ${err.message}`);
      throw new BadRequestException(`Shippo error: ${err.message}`);
    }
  }

  /** Create a shipment from a raw request body (full SDK shape) */
  createShipmentRaw(request: Record<string, unknown>) {
    return this.safeCall('shipments.createRaw', () =>
      (this.client as any).shipments.create({ async: false, ...request }),
    );
  }

  /** Rates for an existing shipment — filtered to UPS (legacy for part-orders) */
  async getUpsRates(shipmentId: string) {
    try {
      const shipment = await this.client.shipments.get(shipmentId);
      const rates = shipment.rates || [];
      return rates.filter(
        (r: any) =>
          r.provider?.toLowerCase() === 'ups' ||
          r.providerImage75?.toLowerCase().includes('ups'),
      );
    } catch (err: any) {
      this.logger.error(`Shippo getUpsRates failed: ${err.message}`);
      throw new BadRequestException(`Shippo error: ${err.message}`);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Rates
  // ──────────────────────────────────────────────────────────────

  getRate(rateId: string) {
    return this.safeCall('rates.get', () => this.client.rates.get(rateId));
  }
  listShipmentRates(shipmentId: string, page?: number, results?: number) {
    return this.safeCall('rates.listShipmentRates', () =>
      this.client.rates.listShipmentRates(shipmentId, page, results),
    );
  }
  listShipmentRatesByCurrencyCode(shipmentId: string, currencyCode: string, page?: number, results?: number) {
    return this.safeCall('rates.listShipmentRatesByCurrencyCode', () =>
      (this.client as any).rates.listShipmentRatesByCurrencyCode({
        shipmentId,
        currencyCode,
        page,
        results,
      }),
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Transactions (labels)
  // ──────────────────────────────────────────────────────────────

  listTransactions(query: {
    page?: number;
    results?: number;
    rate?: string;
    trackingNumber?: string;
    objectStatus?: string;
  } = {}) {
    return this.safeCall('transactions.list', () => (this.client as any).transactions.list(query));
  }

  getTransaction(transactionId: string) {
    return this.safeCall('transactions.get', () => this.client.transactions.get(transactionId));
  }

  async buyLabel(rateId: string, labelFileType: 'PDF' | 'PDF_4x6' | 'PNG' | 'ZPLII' = 'PDF') {
    try {
      const transaction = await this.client.transactions.create({
        rate: rateId,
        labelFileType: labelFileType as any,
        async: false,
      });
      if (transaction.status !== 'SUCCESS') {
        const messages = (transaction.messages || []).map((m: any) => m.text).join('; ');
        throw new BadRequestException(`Shippo label purchase failed: ${messages}`);
      }
      return transaction;
    } catch (err: any) {
      this.logger.error(`Shippo buyLabel failed: ${err.message}`);
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Shippo error: ${err.message}`);
    }
  }

  /** Create a transaction from a raw body (supports instant-label flows without a rate id) */
  createTransaction(request: Record<string, unknown>) {
    return this.safeCall('transactions.create', () =>
      (this.client as any).transactions.create({ async: false, ...request }),
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Tracking
  // ──────────────────────────────────────────────────────────────

  /** Register a tracking number so Shippo sends webhooks for it */
  registerTracking(carrier: string, trackingNumber: string, metadata?: string) {
    return this.safeCall('tracks.create', () =>
      (this.client as any).trackingStatus.create({
        carrier,
        trackingNumber,
        ...(metadata && { metadata }),
      }),
    );
  }

  async getTracking(carrier: string, trackingNumber: string) {
    try {
      return await this.client.trackingStatus.get(trackingNumber, carrier);
    } catch (err: any) {
      this.logger.error(`Shippo getTracking failed: ${err.message}`);
      return null;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Refunds
  // ──────────────────────────────────────────────────────────────

  listRefunds(query: { page?: number; results?: number } = {}) {
    return this.safeCall('refunds.list', () => (this.client as any).refunds.list(query));
  }
  getRefund(refundId: string) {
    return this.safeCall('refunds.get', () => this.client.refunds.get(refundId));
  }
  async refundLabel(transactionId: string) {
    try {
      return await this.client.refunds.create({ transaction: transactionId, async: false });
    } catch (err: any) {
      this.logger.error(`Shippo refundLabel failed: ${err.message}`);
      throw new BadRequestException(`Shippo refund error: ${err.message}`);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Carrier Accounts
  // ──────────────────────────────────────────────────────────────

  listCarrierAccounts(query: { carrier?: string; serviceLevels?: string[]; page?: number; results?: number } = {}) {
    return this.safeCall('carrierAccounts.list', () => (this.client as any).carrierAccounts.list(query));
  }
  getCarrierAccount(id: string) {
    return this.safeCall('carrierAccounts.get', () => this.client.carrierAccounts.get(id));
  }
  createCarrierAccount(payload: Record<string, unknown>) {
    return this.safeCall('carrierAccounts.create', () => (this.client as any).carrierAccounts.create(payload));
  }
  updateCarrierAccount(id: string, payload: Record<string, unknown>) {
    return this.safeCall('carrierAccounts.update', () => (this.client as any).carrierAccounts.update(id, payload));
  }
  initiateOauth2Signin(carrierAccountId: string, redirectUri: string, state?: string) {
    return this.safeCall('carrierAccounts.initiateOauth2Signin', () =>
      (this.client as any).carrierAccounts.initiateOauth2Signin(carrierAccountId, redirectUri, state),
    );
  }
  registerCarrierAccount(payload: Record<string, unknown>) {
    return this.safeCall('carrierAccounts.register', () => (this.client as any).carrierAccounts.register(payload));
  }
  getRegistrationStatus(carrier: string) {
    return this.safeCall('carrierAccounts.getRegistrationStatus', () =>
      (this.client as any).carrierAccounts.getRegistrationStatus(carrier),
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Carrier Parcel Templates
  // ──────────────────────────────────────────────────────────────

  listCarrierParcelTemplates(carrier?: string, include: 'all' | 'user' | 'enabled' = 'all') {
    return this.safeCall('carrierParcelTemplates.list', () =>
      (this.client as any).carrierParcelTemplates.list(include, carrier),
    );
  }
  getCarrierParcelTemplate(token: string) {
    return this.safeCall('carrierParcelTemplates.get', () =>
      (this.client as any).carrierParcelTemplates.get(token),
    );
  }

  async listUpsCarrierParcelTemplates() {
    return this.listSupportedCarrierParcelTemplates();
  }

  /**
   * Fetch carrier parcel templates for the carriers the US operation uses
   * (UPS + FedEx), and tag each one with its carrier. Falls back to
   * UPS_STATIC_TEMPLATES if Shippo returns nothing.
   */
  async listSupportedCarrierParcelTemplates() {
    const wanted = ['ups', 'fedex'] as const;
    const out: Array<{
      token: string;
      name: string;
      length: number;
      width: number;
      height: number;
      distance_unit: string;
      carrier: string;
    }> = [];

    for (const carrier of wanted) {
      try {
        const response = await (this.client as any).carrierParcelTemplates.list(
          'all',
          carrier,
        );
        const results = response?.results || response;
        if (!Array.isArray(results)) continue;

        // Shippo sometimes ignores the carrier filter; keep only entries we
        // can confidently attribute to this carrier.
        const matches = results.filter((t: any) => {
          const token = String(t.token ?? '').toLowerCase();
          const name = String(t.name ?? '').toLowerCase();
          const tCarrier = String(t.carrier ?? '').toLowerCase();
          return (
            tCarrier === carrier ||
            token.startsWith(`${carrier}_`) ||
            name.startsWith(`${carrier} `)
          );
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
      } catch (err: any) {
        this.logger.warn(
          `Shippo carrierParcelTemplates.list for ${carrier} failed: ${err.message}`,
        );
      }
    }

    if (out.length === 0) {
      return UPS_STATIC_TEMPLATES.map((t) => ({ ...t, carrier: 'ups' }));
    }
    return out;
  }

  // ──────────────────────────────────────────────────────────────
  // User Parcel Templates
  // ──────────────────────────────────────────────────────────────

  listUserParcelTemplates() {
    return this.safeCall('userParcelTemplates.list', () =>
      (this.client as any).userParcelTemplates.list(),
    );
  }
  getUserParcelTemplate(id: string) {
    return this.safeCall('userParcelTemplates.get', () =>
      (this.client as any).userParcelTemplates.get(id),
    );
  }

  async createUserParcelTemplate(params: {
    name: string;
    length: number | string;
    width: number | string;
    height: number | string;
    distanceUnit: 'in' | 'cm';
    weight?: number | string;
    weightUnit?: 'lb' | 'kg' | 'oz' | 'g';
  }) {
    const hasWeight = params.weight !== undefined && params.weight !== null && Number(params.weight) > 0;
    const request: Record<string, unknown> = {
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
      const response = await (this.client as any).userParcelTemplates.create(request);
      return response;
    } catch (err: any) {
      const status: number | undefined = err?.statusCode;
      const body: string | undefined = err?.body;
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
        } catch (parseErr) {
          this.logger.error(`Failed to parse Shippo success body: ${parseErr}`);
        }
      }
      this.logger.error(
        `Shippo userParcelTemplates.create failed: ${err.message} | status=${status} body=${body}`,
      );
      throw err;
    }
  }

  async updateUserParcelTemplate(
    objectId: string,
    params: {
      name: string;
      length: number | string;
      width: number | string;
      height: number | string;
      distanceUnit: 'in' | 'cm';
      weight?: number | string;
      weightUnit?: 'lb' | 'kg' | 'oz' | 'g';
    },
  ) {
    const hasWeight = params.weight !== undefined && params.weight !== null && Number(params.weight) > 0;
    const request: Record<string, unknown> = {
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
      const response = await (this.client as any).userParcelTemplates.update(objectId, request);
      return response;
    } catch (err: any) {
      const status: number | undefined = err?.statusCode;
      const body: string | undefined = err?.body;
      if (status && status >= 200 && status < 300 && body) {
        try {
          const parsed = JSON.parse(body);
          return { ...parsed, objectId: parsed.object_id ?? parsed.objectId };
        } catch {
          /* fall through */
        }
      }
      this.logger.error(
        `Shippo userParcelTemplates.update failed for ${objectId}: ${err.message} | status=${status} body=${body}`,
      );
      throw err;
    }
  }

  async deleteUserParcelTemplate(objectId: string) {
    try {
      return await (this.client as any).userParcelTemplates.delete(objectId);
    } catch (err: any) {
      const status = err?.statusCode ?? err?.rawResponse?.status ?? 'unknown';
      this.logger.error(
        `Shippo userParcelTemplates.delete failed for ${objectId}: ${err.message} | status=${status}`,
      );
      throw err;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Customs Items
  // ──────────────────────────────────────────────────────────────

  listCustomsItems(page?: number, results?: number) {
    return this.safeCall('customsItems.list', () => (this.client as any).customsItems.list(page, results));
  }
  getCustomsItem(id: string) {
    return this.safeCall('customsItems.get', () => this.client.customsItems.get(id));
  }
  createCustomsItem(payload: Record<string, unknown>) {
    return this.safeCall('customsItems.create', () => (this.client as any).customsItems.create(payload));
  }

  // ──────────────────────────────────────────────────────────────
  // Customs Declarations
  // ──────────────────────────────────────────────────────────────

  listCustomsDeclarations(page?: number, results?: number) {
    return this.safeCall('customsDeclarations.list', () =>
      (this.client as any).customsDeclarations.list(page, results),
    );
  }
  getCustomsDeclaration(id: string) {
    return this.safeCall('customsDeclarations.get', () => this.client.customsDeclarations.get(id));
  }
  createCustomsDeclaration(payload: Record<string, unknown>) {
    return this.safeCall('customsDeclarations.create', () =>
      (this.client as any).customsDeclarations.create(payload),
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Manifests
  // ──────────────────────────────────────────────────────────────

  listManifests(page?: number, results?: number) {
    return this.safeCall('manifests.list', () => (this.client as any).manifests.list(page, results));
  }
  getManifest(id: string) {
    return this.safeCall('manifests.get', () => this.client.manifests.get(id));
  }
  createManifest(payload: {
    carrierAccount: string;
    shipmentDate: string;
    transactions: string[];
    addressFrom: Record<string, unknown> | string;
    metadata?: string;
  }) {
    return this.safeCall('manifests.create', () => (this.client as any).manifests.create(payload));
  }

  // ──────────────────────────────────────────────────────────────
  // Orders (Shippo dashboard orders)
  // ──────────────────────────────────────────────────────────────

  listOrders(query: { page?: number; results?: number; orderStatus?: string[]; shopApp?: string } = {}) {
    return this.safeCall('orders.list', () => (this.client as any).orders.list(query));
  }
  getOrder(id: string) {
    return this.safeCall('orders.get', () => this.client.orders.get(id));
  }
  createOrder(payload: Record<string, unknown>) {
    return this.safeCall('orders.create', () => (this.client as any).orders.create(payload));
  }

  // ──────────────────────────────────────────────────────────────
  // Pickups
  // ──────────────────────────────────────────────────────────────

  createPickup(payload: {
    carrierAccount: string;
    location: Record<string, unknown>;
    transactions: string[];
    requestedStartTime: string;
    requestedEndTime: string;
    isTest?: boolean;
    metadata?: string;
  }) {
    return this.safeCall('pickups.create', () => (this.client as any).pickups.create(payload));
  }

  // ──────────────────────────────────────────────────────────────
  // Service Groups
  // ──────────────────────────────────────────────────────────────

  listServiceGroups(query: Record<string, unknown> = {}) {
    return this.safeCall('serviceGroups.list', () => (this.client as any).serviceGroups.list(query));
  }
  createServiceGroup(payload: Record<string, unknown>) {
    return this.safeCall('serviceGroups.create', () =>
      (this.client as any).serviceGroups.create(payload),
    );
  }
  updateServiceGroup(payload: Record<string, unknown>) {
    return this.safeCall('serviceGroups.update', () =>
      (this.client as any).serviceGroups.update(payload),
    );
  }
  deleteServiceGroup(id: string) {
    return this.safeCall('serviceGroups.delete', () =>
      (this.client as any).serviceGroups.delete(id),
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Batches
  // ──────────────────────────────────────────────────────────────

  createBatch(payload: Record<string, unknown>) {
    return this.safeCall('batches.create', () => (this.client as any).batches.create(payload));
  }
  getBatch(id: string, page?: number, results?: number) {
    return this.safeCall('batches.get', () =>
      (this.client as any).batches.get(id, page, results),
    );
  }
  addShipmentsToBatch(batchId: string, shipments: Array<Record<string, unknown>>) {
    return this.safeCall('batches.addShipments', () =>
      (this.client as any).batches.addShipments(shipments, batchId),
    );
  }
  removeShipmentsFromBatch(batchId: string, shipmentIds: string[]) {
    return this.safeCall('batches.removeShipments', () =>
      (this.client as any).batches.removeShipments(shipmentIds, batchId),
    );
  }
  purchaseBatch(batchId: string) {
    return this.safeCall('batches.purchase', () => (this.client as any).batches.purchase(batchId));
  }

  // ──────────────────────────────────────────────────────────────
  // Rates at Checkout (live rates + default parcel template)
  // ──────────────────────────────────────────────────────────────

  createLiveRates(payload: Record<string, unknown>) {
    return this.safeCall('ratesAtCheckout.create', () =>
      (this.client as any).ratesAtCheckout.create(payload),
    );
  }
  getDefaultParcelTemplate() {
    return this.safeCall('ratesAtCheckout.getDefaultParcelTemplate', () =>
      (this.client as any).ratesAtCheckout.getDefaultParcelTemplate({}),
    );
  }
  updateDefaultParcelTemplate(payload: Record<string, unknown>) {
    return this.safeCall('ratesAtCheckout.updateDefaultParcelTemplate', () =>
      (this.client as any).ratesAtCheckout.updateDefaultParcelTemplate(payload),
    );
  }
  deleteDefaultParcelTemplate() {
    return this.safeCall('ratesAtCheckout.deleteDefaultParcelTemplate', () =>
      (this.client as any).ratesAtCheckout.deleteDefaultParcelTemplate({}),
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Webhooks (management — events land in WebhookController)
  // ──────────────────────────────────────────────────────────────

  listWebhooks() {
    return this.safeCall('webhooks.list', () => (this.client as any).webhooks.listWebhooks());
  }
  getWebhook(id: string) {
    return this.safeCall('webhooks.get', () => (this.client as any).webhooks.getWebhook(id));
  }
  createWebhook(payload: { url: string; event?: string; eventType?: string; active?: boolean; isActive?: boolean; isTest?: boolean }) {
    // Normalize to Shippo SDK shape (`event`/`active`).
    const sdkPayload: Record<string, unknown> = {
      url: payload.url,
      event: payload.event ?? payload.eventType,
      active: payload.active ?? payload.isActive,
    };
    if (payload.isTest !== undefined) sdkPayload.isTest = payload.isTest;
    return this.safeCall('webhooks.create', () => (this.client as any).webhooks.createWebhook(sdkPayload));
  }
  updateWebhook(id: string, payload: Record<string, unknown>) {
    // Normalize eventType → event, isActive → active if caller sent legacy keys.
    const sdkPayload: Record<string, unknown> = { ...payload };
    if (sdkPayload.eventType && !sdkPayload.event) sdkPayload.event = sdkPayload.eventType;
    if (sdkPayload.isActive !== undefined && sdkPayload.active === undefined) sdkPayload.active = sdkPayload.isActive;
    delete sdkPayload.eventType;
    delete sdkPayload.isActive;
    return this.safeCall('webhooks.update', () =>
      (this.client as any).webhooks.updateWebhook(sdkPayload, id),
    );
  }
  deleteWebhook(id: string) {
    return this.safeCall('webhooks.delete', () =>
      (this.client as any).webhooks.deleteWebhook(id),
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Webhook inbound — HMAC verification
  // ──────────────────────────────────────────────────────────────

  /**
   * Verify a Shippo webhook signature. Header format: `t=<timestamp>,v1=<hexSignature>`.
   * Signed payload is `<timestamp>.<rawBody>`, HMAC-SHA256 with the shared secret.
   */
  verifyWebhookSignature(rawBody: Buffer | string, signatureHeader: string | undefined): boolean {
    const secret = process.env.SHIPPO_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn('SHIPPO_WEBHOOK_SECRET not set — rejecting webhook');
      return false;
    }
    if (!signatureHeader) return false;

    const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, chunk) => {
      const [k, v] = chunk.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});
    const timestamp = parts['t'];
    const signature = parts['v1'];
    if (!timestamp || !signature) return false;

    const body = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
    const signedPayload = `${timestamp}.${body}`;

    // crypto is imported lazily to keep startup light
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
      return false;
    }
  }
}

/** Hardcoded UPS box templates (fallback when carrier_parcel_templates API unavailable) */
export const UPS_STATIC_TEMPLATES = [
  { token: 'UPS_Express_Box_Small',  name: 'UPS Express Box Small',  length: 13, width: 11, height: 2, distance_unit: 'in' },
  { token: 'UPS_Express_Box_Medium', name: 'UPS Express Box Medium', length: 15, width: 11, height: 3, distance_unit: 'in' },
  { token: 'UPS_Express_Box_Large',  name: 'UPS Express Box Large',  length: 18, width: 13, height: 3, distance_unit: 'in' },
  { token: 'UPS_Express_Tube',       name: 'UPS Express Tube',       length: 38, width: 6,  height: 6, distance_unit: 'in' },
  { token: 'UPS_Express_Pak',        name: 'UPS Express Pak',        length: 16, width: 12.75, height: 2, distance_unit: 'in' },
  { token: 'UPS_Laboratory_Pak',     name: 'UPS Laboratory Pak',     length: 17.5, width: 14.5, height: 2, distance_unit: 'in' },
  { token: 'UPS_Legal_Flat_Rate_Envelope', name: 'UPS Legal Flat Rate Envelope', length: 15, width: 9.5, height: 0.5, distance_unit: 'in' },
  { token: 'UPS_Padded_Pak',         name: 'UPS Padded Pak',         length: 14.75, width: 11, height: 2, distance_unit: 'in' },
];
