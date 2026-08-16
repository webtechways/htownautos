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
var MarketCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketCheckService = void 0;
const common_1 = require("@nestjs/common");
let MarketCheckService = MarketCheckService_1 = class MarketCheckService {
    logger = new common_1.Logger(MarketCheckService_1.name);
    baseUrl = 'https://api.marketcheck.com/v2/specs/car/terms';
    decodeUrl = 'https://api.marketcheck.com/v2/decode/car';
    priceUrl = 'https://api.marketcheck.com/v2/predict/car/us/marketcheck_price';
    searchUrl = 'https://api.marketcheck.com/v2/search/car/active';
    apiKey;
    constructor() {
        this.apiKey = process.env.MARKETCHECK_API_KEY || '';
        if (!this.apiKey) {
            this.logger.warn('MARKETCHECK_API_KEY is not set');
        }
    }
    pageSize = 1000;
    async fetchTermsPage(field, offset, filters = {}) {
        const params = new URLSearchParams({
            api_key: this.apiKey,
            field: `${field}|${offset}|${this.pageSize}`,
            ...filters,
        });
        const url = `${this.baseUrl}?${params.toString()}`;
        const safeUrl = url.replace(/api_key=[^&]+/, 'api_key=***');
        this.logger.log(`→ MarketCheck API GET ${safeUrl}`);
        const start = Date.now();
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
            });
            const duration = Date.now() - start;
            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.error(`← MarketCheck API ${response.status} ${response.statusText} (${duration}ms) ${safeUrl}`);
                this.logger.error(`← MarketCheck API Error Body: ${errorBody}`);
                throw new common_1.InternalServerErrorException('Failed to fetch data from MarketCheck');
            }
            const data = await response.json();
            const results = data[field] || [];
            this.logger.log(`← MarketCheck API 200 OK (${duration}ms) field=${field} offset=${offset} results=${results.length}`);
            return results;
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.InternalServerErrorException)
                throw error;
            this.logger.error(`← MarketCheck API FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to fetch data from MarketCheck');
        }
    }
    async fetchTerms(field, filters = {}) {
        const allResults = [];
        let offset = 0;
        while (true) {
            const page = await this.fetchTermsPage(field, offset, filters);
            allResults.push(...page);
            if (page.length < this.pageSize) {
                break;
            }
            offset += this.pageSize;
        }
        this.logger.log(`MarketCheck total for field=${field}: ${allResults.length} results (${Math.ceil(offset / this.pageSize) + 1} pages)`);
        return allResults;
    }
    async getMakes(year) {
        return this.fetchTerms('make', { year });
    }
    async getModels(year, make) {
        return this.fetchTerms('model', { year, make });
    }
    async getTrims(year, make, model) {
        return this.fetchTerms('trim', { year, make, model });
    }
    async decodeVin(vin) {
        if (!vin || vin.length !== 17) {
            throw new common_1.BadRequestException('VIN must be exactly 17 characters');
        }
        const url = `${this.decodeUrl}/${vin}/specs?api_key=${this.apiKey}`;
        const safeUrl = url.replace(/api_key=[^&]+/, 'api_key=***');
        this.logger.log(`→ MarketCheck Decode API GET ${safeUrl}`);
        const start = Date.now();
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
            });
            const duration = Date.now() - start;
            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.error(`← MarketCheck Decode API ${response.status} ${response.statusText} (${duration}ms)`);
                this.logger.error(`← MarketCheck Decode API Error Body: ${errorBody}`);
                if (response.status === 404) {
                    throw new common_1.BadRequestException('VIN not found or invalid');
                }
                throw new common_1.InternalServerErrorException('Failed to decode VIN from MarketCheck');
            }
            const data = await response.json();
            this.logger.log(`← MarketCheck Decode API 200 OK (${duration}ms) year=${data.year} make=${data.make} model=${data.model}`);
            return {
                vin: vin.toUpperCase(),
                year: data.year ?? null,
                make: data.make ?? null,
                model: data.model ?? null,
                trim: data.trim ?? null,
                bodyType: data.body_type ?? null,
                transmission: data.transmission ?? null,
                drivetrain: data.drivetrain ?? null,
                fuelType: data.fuel_type ?? null,
                engine: data.engine ?? null,
                cylinders: data.cylinders ?? null,
                doors: data.doors ?? null,
                exteriorColor: data.exterior_color ?? null,
                interiorColor: data.interior_color ?? null,
                vehicleType: data.vehicle_type ?? null,
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`← MarketCheck Decode API FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to decode VIN from MarketCheck');
        }
    }
    async getPrice(vin, miles, zip, dealerType = 'independent') {
        const params = new URLSearchParams({
            api_key: this.apiKey,
            vin,
            miles: miles.toString(),
            dealer_type: dealerType,
            zip,
        });
        const url = `${this.priceUrl}?${params.toString()}`;
        const safeUrl = url.replace(/api_key=[^&]+/, 'api_key=***');
        this.logger.log(`→ MarketCheck Price API GET ${safeUrl}`);
        const start = Date.now();
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
            });
            const duration = Date.now() - start;
            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.error(`← MarketCheck Price API ${response.status} ${response.statusText} (${duration}ms)`);
                this.logger.error(`← MarketCheck Price API Error Body: ${errorBody}`);
                if (response.status === 400) {
                    throw new common_1.BadRequestException('MarketCheck could not decode this VIN for pricing');
                }
                throw new common_1.InternalServerErrorException('Failed to fetch price from MarketCheck');
            }
            const data = await response.json();
            this.logger.log(`← MarketCheck Price API 200 OK (${duration}ms) RAW RESPONSE: ${JSON.stringify(data)}`);
            const predictedPrice = data.predicted_price ?? data.price ?? data.marketcheck_price ?? data.estimated_price ?? null;
            return {
                marketcheckPrice: predictedPrice,
                msrp: data.msrp ?? data.base_msrp ?? null,
                cached: false,
                zip,
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException)
                throw error;
            this.logger.error(`← MarketCheck Price API FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to fetch price from MarketCheck');
        }
    }
    async getComparables(make, model, year, zip) {
        const params = new URLSearchParams({
            api_key: this.apiKey,
            make,
            model,
            year,
            zip,
            radius: '100',
            rows: '25',
            sort_by: 'dist',
            sort_order: 'asc',
        });
        const url = `${this.searchUrl}?${params.toString()}`;
        const safeUrl = url.replace(/api_key=[^&]+/, 'api_key=***');
        this.logger.log(`→ MarketCheck Search API GET ${safeUrl}`);
        const start = Date.now();
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
            });
            const duration = Date.now() - start;
            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.error(`← MarketCheck Search API ${response.status} ${response.statusText} (${duration}ms)`);
                this.logger.error(`← MarketCheck Search API Error Body: ${errorBody}`);
                throw new common_1.InternalServerErrorException('Failed to fetch comparables from MarketCheck');
            }
            const data = await response.json();
            this.logger.log(`← MarketCheck Search API 200 OK (${duration}ms) numFound=${data.num_found}`);
            return {
                listings: data.listings ?? [],
                numFound: data.num_found ?? 0,
                cached: false,
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.InternalServerErrorException)
                throw error;
            this.logger.error(`← MarketCheck Search API FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to fetch comparables from MarketCheck');
        }
    }
    async getComparablesByVin(vin, zip) {
        if (!vin || vin.length !== 17) {
            throw new common_1.BadRequestException('VIN must be exactly 17 characters');
        }
        const params = new URLSearchParams({
            api_key: this.apiKey,
            vins: vin,
            match: 'year,make,model,trim',
            zip,
            radius: '100',
            rows: '25',
            stats: 'price,miles,days_on_market',
            sort_by: 'dist',
            sort_order: 'asc',
        });
        const url = `${this.searchUrl}?${params.toString()}`;
        const safeUrl = url.replace(/api_key=[^&]+/, 'api_key=***');
        this.logger.log(`→ MarketCheck VIN Search API GET ${safeUrl}`);
        const start = Date.now();
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
            });
            const duration = Date.now() - start;
            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.error(`← MarketCheck VIN Search API ${response.status} ${response.statusText} (${duration}ms)`);
                this.logger.error(`← MarketCheck VIN Search API Error Body: ${errorBody}`);
                throw new common_1.InternalServerErrorException('Failed to fetch VIN comparables from MarketCheck');
            }
            const data = await response.json();
            this.logger.log(`← MarketCheck VIN Search API 200 OK (${duration}ms) numFound=${data.num_found}`);
            return {
                listings: data.listings ?? [],
                numFound: data.num_found ?? 0,
                cached: false,
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.InternalServerErrorException)
                throw error;
            this.logger.error(`← MarketCheck VIN Search API FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to fetch VIN comparables from MarketCheck');
        }
    }
};
exports.MarketCheckService = MarketCheckService;
exports.MarketCheckService = MarketCheckService = MarketCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MarketCheckService);
//# sourceMappingURL=marketcheck.service.js.map