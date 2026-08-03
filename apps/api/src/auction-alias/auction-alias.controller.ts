import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkJwtGuard, CurrentUser } from '@htownautos/auth';
import { CANONICAL_FIELDS, type CanonicalField } from '@htownautos/common';
import { AuctionAliasService } from './auction-alias.service';
import { SetAliasDto } from './dto/set-alias.dto';

function asField(field?: string): CanonicalField {
  return (CANONICAL_FIELDS as readonly string[]).includes(field ?? '')
    ? (field as CanonicalField)
    : 'make';
}

/**
 * Staff-managed alias → canonical merges for auction filter fields (make / model
 * / trim / color). Setting an alias reclassifies every lot with that value across
 * facets and buyer matching immediately (read live).
 */
@ApiTags('Auction value aliases')
@Controller('auctions/value-aliases')
@UseGuards(ClerkJwtGuard)
@ApiBearerAuth()
export class AuctionAliasController {
  constructor(private readonly service: AuctionAliasService) {}

  @Get()
  @ApiOperation({ summary: 'List distinct values for a field with their canonical + review state' })
  list(
    @Query('field') field?: string,
    @Query('search') search?: string,
    @Query('onlyUnreviewed') onlyUnreviewed?: string,
  ) {
    return this.service.aggregate(asField(field), {
      search,
      onlyUnreviewed: onlyUnreviewed === 'true',
    });
  }

  @Get('unreviewed-count')
  @ApiOperation({ summary: 'Count of values (all fields) still needing review' })
  async count() {
    return { count: await this.service.unreviewedCount() };
  }

  @Post()
  @ApiOperation({ summary: 'Merge a variant into a canonical value' })
  set(@Body() dto: SetAliasDto, @CurrentUser('sub') userId: string) {
    return this.service.setAlias(dto.field, dto.aliasKey, dto.canonical, userId ?? null);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an alias (value reverts to its normalized self)' })
  async remove(@Query('field') field: string, @Query('aliasKey') aliasKey: string) {
    await this.service.remove(field, aliasKey);
  }
}
