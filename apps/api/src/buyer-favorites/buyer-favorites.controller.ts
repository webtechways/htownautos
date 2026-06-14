import {
  Controller,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentTenant, ClerkJwtGuard } from '@htownautos/auth';
import { BuyerFavoritesService } from './buyer-favorites.service';

/**
 * Staff-facing favorites: lets the CRM dashboard read (and optionally clear) the
 * favorite auction lots a customer saved from the public web. Same data store as
 * the portal endpoints in PortalController.
 */
@ApiTags('Buyer Favorites')
@Controller('buyers/:buyerId/favorites')
@UseGuards(ClerkJwtGuard)
export class BuyerFavoritesController {
  constructor(private readonly service: BuyerFavoritesService) {}

  @Get()
  @ApiOperation({ summary: "List a buyer's favorite auction lots (with listing detail)" })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  list(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.service.list(buyerId, tenantId);
  }

  @Delete(':lotNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a favorite from a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'lotNumber', description: 'Auction lot number' })
  remove(
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('lotNumber') lotNumber: string,
  ) {
    return this.service.remove(buyerId, lotNumber);
  }
}
