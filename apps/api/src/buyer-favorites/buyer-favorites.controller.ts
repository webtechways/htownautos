import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentTenant, ClerkJwtGuard } from '@htownautos/auth';
import { BuyerFavoritesService } from './buyer-favorites.service';
import { ToggleBuyerFavoriteDto } from './dto/toggle-buyer-favorite.dto';

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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a favorite auction lot to a buyer by lot number or VIN (staff/dashboard)' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  add(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() dto: ToggleBuyerFavoriteDto,
  ) {
    return this.service.add(buyerId, tenantId, {
      lotNumber: dto.lotNumber,
      vin: dto.vin,
    });
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
