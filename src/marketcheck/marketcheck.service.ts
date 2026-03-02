import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';

interface MarketCheckTermsResponse {
  [field: string]: string[];
}

export interface VinDecodeResult {
  vin: string;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  bodyType: string | null;
  transmission: string | null;
  drivetrain: string | null;
  fuelType: string | null;
  engine: string | null;
  cylinders: number | null;
  doors: number | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  vehicleType: string | null;
}

export interface MarketCheckPriceResult {
  marketcheckPrice: number | null;
  msrp: number | null;
  cached: boolean;
  zip: string;
}

export interface MarketCheckCompsResult {
  listings: any[];
  numFound: number;
  cached: boolean;
}

@Injectable()
export class MarketCheckService {
  private readonly logger = new Logger(MarketCheckService.name);
  private readonly baseUrl = 'https://api.marketcheck.com/v2/specs/car/terms';
  private readonly decodeUrl = 'https://api.marketcheck.com/v2/decode/car';
  private readonly priceUrl = 'https://api.marketcheck.com/v2/predict/car/us/marketcheck_price';
  private readonly searchUrl = 'https://api.marketcheck.com/v2/search/car/active';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.MARKETCHECK_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('MARKETCHECK_API_KEY is not set');
    }
  }

  private readonly pageSize = 1000;

  private async fetchTermsPage(
    field: string,
    offset: number,
    filters: Record<string, string> = {},
  ): Promise<string[]> {
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
        this.logger.error(
          `← MarketCheck API ${response.status} ${response.statusText} (${duration}ms) ${safeUrl}`,
        );
        this.logger.error(`← MarketCheck API Error Body: ${errorBody}`);
        throw new InternalServerErrorException('Failed to fetch data from MarketCheck');
      }

      const data: MarketCheckTermsResponse = await response.json();
      const results = data[field] || [];
      this.logger.log(`← MarketCheck API 200 OK (${duration}ms) field=${field} offset=${offset} results=${results.length}`);
      return results;
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(`← MarketCheck API FAILED (${duration}ms): ${error}`);
      throw new InternalServerErrorException('Failed to fetch data from MarketCheck');
    }
  }

  private async fetchTerms(
    field: string,
    filters: Record<string, string> = {},
  ): Promise<string[]> {
    const allResults: string[] = [];
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

  async getMakes(year: string): Promise<string[]> {
    return this.fetchTerms('make', { year });
  }

  async getModels(year: string, make: string): Promise<string[]> {
    return this.fetchTerms('model', { year, make });
  }

  async getTrims(year: string, make: string, model: string): Promise<string[]> {
    return this.fetchTerms('trim', { year, make, model });
  }

  /**
   * Decode a VIN to get vehicle specifications
   * Uses MarketCheck API: https://api.marketcheck.com/v2/decode/car/{vin}/specs
   */
  async decodeVin(vin: string): Promise<VinDecodeResult> {
    if (!vin || vin.length !== 17) {
      throw new BadRequestException('VIN must be exactly 17 characters');
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
        this.logger.error(
          `← MarketCheck Decode API ${response.status} ${response.statusText} (${duration}ms)`,
        );
        this.logger.error(`← MarketCheck Decode API Error Body: ${errorBody}`);

        if (response.status === 404) {
          throw new BadRequestException('VIN not found or invalid');
        }
        throw new InternalServerErrorException('Failed to decode VIN from MarketCheck');
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
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`← MarketCheck Decode API FAILED (${duration}ms): ${error}`);
      throw new InternalServerErrorException('Failed to decode VIN from MarketCheck');
    }
  }

  /**
   * Get MarketCheck price prediction for a vehicle
   * Uses: https://api.marketcheck.com/v2/predict/car/us/marketcheck_price
   */
  async getPrice(
    vin: string,
    miles: number,
    zip: string,
    dealerType = 'independent',
  ): Promise<MarketCheckPriceResult> {
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
        this.logger.error(
          `← MarketCheck Price API ${response.status} ${response.statusText} (${duration}ms)`,
        );
        this.logger.error(`← MarketCheck Price API Error Body: ${errorBody}`);

        if (response.status === 400) {
          throw new BadRequestException('MarketCheck could not decode this VIN for pricing');
        }
        throw new InternalServerErrorException('Failed to fetch price from MarketCheck');
      }

      const data = await response.json();
      this.logger.log(
        `← MarketCheck Price API 200 OK (${duration}ms) RAW RESPONSE: ${JSON.stringify(data)}`,
      );

      const predictedPrice =
        data.predicted_price ?? data.price ?? data.marketcheck_price ?? data.estimated_price ?? null;

      return {
        marketcheckPrice: predictedPrice,
        msrp: data.msrp ?? data.base_msrp ?? null,
        cached: false,
        zip,
      };
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) throw error;
      this.logger.error(`← MarketCheck Price API FAILED (${duration}ms): ${error}`);
      throw new InternalServerErrorException('Failed to fetch price from MarketCheck');
    }
  }

  /**
   * Search for comparable active listings
   * Uses: https://api.marketcheck.com/v2/search/car/active
   */
  async getComparables(
    make: string,
    model: string,
    year: string,
    zip: string,
  ): Promise<MarketCheckCompsResult> {
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
        this.logger.error(
          `← MarketCheck Search API ${response.status} ${response.statusText} (${duration}ms)`,
        );
        this.logger.error(`← MarketCheck Search API Error Body: ${errorBody}`);
        throw new InternalServerErrorException('Failed to fetch comparables from MarketCheck');
      }

      const data = await response.json();
      this.logger.log(
        `← MarketCheck Search API 200 OK (${duration}ms) numFound=${data.num_found}`,
      );

      return {
        listings: data.listings ?? [],
        numFound: data.num_found ?? 0,
        cached: false,
      };
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(`← MarketCheck Search API FAILED (${duration}ms): ${error}`);
      throw new InternalServerErrorException('Failed to fetch comparables from MarketCheck');
    }
  }

  /**
   * Search for comparable active listings by VIN
   * Uses: https://api.marketcheck.com/v2/search/car/active with vins + match params
   */
  async getComparablesByVin(
    vin: string,
    zip: string,
  ): Promise<MarketCheckCompsResult> {
    if (!vin || vin.length !== 17) {
      throw new BadRequestException('VIN must be exactly 17 characters');
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
        this.logger.error(
          `← MarketCheck VIN Search API ${response.status} ${response.statusText} (${duration}ms)`,
        );
        this.logger.error(`← MarketCheck VIN Search API Error Body: ${errorBody}`);
        throw new InternalServerErrorException('Failed to fetch VIN comparables from MarketCheck');
      }

      const data = await response.json();
      this.logger.log(
        `← MarketCheck VIN Search API 200 OK (${duration}ms) numFound=${data.num_found}`,
      );

      return {
        listings: data.listings ?? [],
        numFound: data.num_found ?? 0,
        cached: false,
      };
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(`← MarketCheck VIN Search API FAILED (${duration}ms): ${error}`);
      throw new InternalServerErrorException('Failed to fetch VIN comparables from MarketCheck');
    }
  }
}
