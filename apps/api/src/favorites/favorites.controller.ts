import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto, FavoriteType } from './dto/toggle-favorite.dto';
import { CurrentUser } from '@htownautos/auth';
import { CurrentTenant } from '@htownautos/auth';
import { ClerkJwtGuard } from '@htownautos/auth';

@Controller('favorites')
@UseGuards(ClerkJwtGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async addFavorite(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ToggleFavoriteDto,
  ) {
    return this.favoritesService.addFavorite(
      tenantId,
      user.id,
      dto.listingId,
      dto.type,
    );
  }

  @Delete()
  async removeFavorite(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ToggleFavoriteDto,
  ) {
    return this.favoritesService.removeFavorite(
      tenantId,
      user.id,
      dto.listingId,
      dto.type,
    );
  }

  @Get('ids')
  async getFavoriteIds(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Query('type') type: FavoriteType,
  ) {
    const ids = await this.favoritesService.getFavoriteIds(
      tenantId,
      user.id,
      type,
    );
    return { ids };
  }

  @Get('check/:listingId')
  async checkFavorite(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('listingId') listingId: string,
    @Query('type') type: FavoriteType,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(
      tenantId,
      user.id,
      listingId,
      type,
    );
    return { isFavorite };
  }
}
