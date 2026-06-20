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

  /** Pull a human message out of the provider's (sometimes nested) error body. */
  private extractProviderMessage(text: string): string {
    try {
      const j = JSON.parse(text);
      const m =
        j?.msg?.message ??
        j?.message ??
        (typeof j?.msg === 'string' ? j.msg : '') ??
        '';
      return String(m || text);
    } catch {
      return text;
    }
  }

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
      // The provider returns 400 with a "Record(s) were not found" message when
      // a VIN simply has no auction history. That is NOT an error for us — return
      // a clean empty result so the UI shows a friendly "no history" state and the
      // snapshot can be recorded.
      const msg = this.extractProviderMessage(text);
      if (/not\s*found|no\s*record|record\(s\)\s*were\s*not/i.test(msg)) {
        return { status: 'not_found', vin: normalizedVin, data: [] };
      }
      this.logger.warn(`Auction provider ${res.status}: ${msg.slice(0, 200)}`);
      throw new BadRequestException(
        msg ? `Historial de subasta: ${msg.slice(0, 160)}` : 'No se pudo obtener el historial de subasta',
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
