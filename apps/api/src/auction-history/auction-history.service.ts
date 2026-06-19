import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

const MIN_VIN_LENGTH = 11;

export interface AuctionRecord {
  sale_index?: number | string;
  price?: string | number;
  'sale status'?: string;
  vname?: string;
  'lot-number'?: string;
  'car-features'?: unknown;
  'title-and-condition'?: unknown;
  'technical-specs'?: unknown;
  'sale-date-location'?: unknown;
  'listing-history'?: unknown;
  year?: string | number;
  make?: string;
  model?: string;
  images?: string[];
  'market-value'?: unknown;
  vin?: string;
  [key: string]: unknown;
}

export interface AuctionHistoryResponse {
  status: string;
  vin: string;
  data: AuctionRecord[];
}

@Injectable()
export class AuctionHistoryService {
  private readonly logger = new Logger(AuctionHistoryService.name);

  async getAuctionHistory(vin: string): Promise<AuctionHistoryResponse> {
    const normalizedVin = vin.trim().toUpperCase();

    if (normalizedVin.length < MIN_VIN_LENGTH) {
      throw new BadRequestException('VIN inválido');
    }

    const key = process.env.VEHICLE_DATABASE;
    if (!key) {
      throw new InternalServerErrorException('VEHICLE_DATABASE no configurada');
    }

    let res: Response;
    try {
      res = await fetch(
        `https://api.vehicledatabases.com/auction/${encodeURIComponent(normalizedVin)}`,
        { headers: { 'x-authkey': key } },
      );
    } catch (err) {
      this.logger.error('Network error fetching auction history', err);
      throw new BadRequestException(
        'No se pudo obtener el historial de subasta',
      );
    }

    if (!res.ok) {
      const text = await res.text();
      throw new BadRequestException(
        `Auction provider error ${res.status}: ${text.slice(0, 200)}`,
      );
    }

    let body: AuctionHistoryResponse;
    try {
      body = (await res.json()) as AuctionHistoryResponse;
    } catch (err) {
      this.logger.error('Failed to parse auction history JSON', err);
      throw new BadRequestException(
        'No se pudo obtener el historial de subasta',
      );
    }

    // Return as-is; frontend handles empty/no-history state when status !== 'success'
    return {
      status: body.status ?? 'error',
      vin: body.vin ?? normalizedVin,
      data: Array.isArray(body.data) ? body.data : [],
    };
  }
}
