"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuctionHistoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionHistoryService = void 0;
const common_1 = require("@nestjs/common");
const MIN_VIN_LENGTH = 11;
let AuctionHistoryService = AuctionHistoryService_1 = class AuctionHistoryService {
    logger = new common_1.Logger(AuctionHistoryService_1.name);
    extractProviderMessage(text) {
        try {
            const j = JSON.parse(text);
            const m = j?.msg?.message ??
                j?.message ??
                (typeof j?.msg === 'string' ? j.msg : '') ??
                '';
            return String(m || text);
        }
        catch {
            return text;
        }
    }
    async getAuctionHistory(vin) {
        const normalizedVin = vin.trim().toUpperCase();
        if (normalizedVin.length < MIN_VIN_LENGTH) {
            throw new common_1.BadRequestException('VIN inválido');
        }
        const key = process.env.VEHICLE_DATABASE;
        if (!key) {
            throw new common_1.InternalServerErrorException('VEHICLE_DATABASE no configurada');
        }
        let res;
        try {
            res = await fetch(`https://api.vehicledatabases.com/auction/${encodeURIComponent(normalizedVin)}`, { headers: { 'x-authkey': key } });
        }
        catch (err) {
            this.logger.error('Network error fetching auction history', err);
            throw new common_1.BadRequestException('No se pudo obtener el historial de subasta');
        }
        if (!res.ok) {
            const text = await res.text();
            const msg = this.extractProviderMessage(text);
            if (/not\s*found|no\s*record|record\(s\)\s*were\s*not/i.test(msg)) {
                return { status: 'not_found', vin: normalizedVin, data: [] };
            }
            this.logger.warn(`Auction provider ${res.status}: ${msg.slice(0, 200)}`);
            throw new common_1.BadRequestException(msg ? `Historial de subasta: ${msg.slice(0, 160)}` : 'No se pudo obtener el historial de subasta');
        }
        let body;
        try {
            body = (await res.json());
        }
        catch (err) {
            this.logger.error('Failed to parse auction history JSON', err);
            throw new common_1.BadRequestException('No se pudo obtener el historial de subasta');
        }
        return {
            status: body.status ?? 'error',
            vin: body.vin ?? normalizedVin,
            data: Array.isArray(body.data) ? body.data : [],
        };
    }
};
exports.AuctionHistoryService = AuctionHistoryService;
exports.AuctionHistoryService = AuctionHistoryService = AuctionHistoryService_1 = __decorate([
    (0, common_1.Injectable)()
], AuctionHistoryService);
//# sourceMappingURL=auction-history.service.js.map