import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClerkJwtGuard, CurrentTenant, CurrentUser, Public } from '@htownautos/auth';
import { BuyerFavoritesShareLinksService } from './buyer-favorites-share-links.service';
import { CreateFavoritesShareLinkDto } from './dto/create-favorites-share-link.dto';

@ApiTags('Buyer Favorites Share Links')
@Controller()
export class BuyerFavoritesShareLinksController {
  constructor(private readonly service: BuyerFavoritesShareLinksService) {}

  // ─── staff (authenticated) ─────────────────────────────────────────

  /**
   * POST /buyers/:buyerId/favorites/share-link
   * Generate a public shareable link to this buyer's favorites list.
   */
  @Post('buyers/:buyerId/favorites/share-link')
  @UseGuards(ClerkJwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a public share link for a buyer's favorites list" })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() dto: CreateFavoritesShareLinkDto,
  ) {
    return this.service.create(buyerId, tenantId, userId, dto);
  }

  // ─── public (no auth) ──────────────────────────────────────────────

  /**
   * GET /public/favorites?token=...
   * Resolve a share token → buyer name + enriched favorites list.
   * No authentication required.
   */
  @Get('public/favorites')
  @Public()
  @ApiOperation({ summary: "Public read-only view of a buyer's shared favorites" })
  @ApiQuery({ name: 'token', required: true, description: '32-byte hex share token' })
  resolvePublic(@Query('token') token: string) {
    return this.service.resolvePublic(token);
  }

  /**
   * DELETE /public/favorites/:lotNumber?token=...
   * Remove a lot from the buyer's favorites list via share token.
   * The ONLY public mutation allowed on the shared link.
   */
  @Delete('public/favorites/:lotNumber')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a lot from the shared favorites list (public, token-gated)' })
  @ApiParam({ name: 'lotNumber', description: 'Auction lot number' })
  @ApiQuery({ name: 'token', required: true, description: '32-byte hex share token' })
  removePublic(
    @Param('lotNumber') lotNumber: string,
    @Query('token') token: string,
  ) {
    return this.service.removePublic(token, lotNumber);
  }
}
