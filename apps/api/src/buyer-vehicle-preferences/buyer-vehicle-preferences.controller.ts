import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { BuyerVehiclePreferencesService } from './buyer-vehicle-preferences.service';
import { CreateBuyerVehiclePreferenceDto } from './dto/create-buyer-vehicle-preference.dto';
import { UpdateBuyerVehiclePreferenceDto } from './dto/update-buyer-vehicle-preference.dto';
import { CreateBuyerMatchExclusionDto } from './dto/create-buyer-match-exclusion.dto';
import {
  CurrentTenant,
  CurrentUser,
  ClerkJwtGuard,
} from '@htownautos/auth';

@ApiTags('Buyer Vehicle Preferences')
@Controller('buyers/:buyerId/vehicle-preferences')
@UseGuards(ClerkJwtGuard)
export class BuyerVehiclePreferencesController {
  constructor(private readonly service: BuyerVehiclePreferencesService) {}

  @Get()
  @ApiOperation({ summary: "List a buyer's wanted vehicle preferences" })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiResponse({ status: HttpStatus.OK })
  list(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.service.list(buyerId, tenantId);
  }

  @Get('matches')
  @ApiOperation({
    summary: 'Auction listings matching the buyer preferences',
    description:
      'Returns all active (non-stale) auction listings that satisfy at ' +
      'least one of the buyer\'s wanted vehicles. Listings whose highBid ' +
      'already exceeds that preference\'s maxCost are excluded. ' +
      'Pass inspectableOnly=true to restrict to yards with physical inspection available.',
  })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiResponse({ status: HttpStatus.OK })
  matches(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Query('inspectableOnly') inspectableOnly?: string,
  ) {
    return this.service.matches(buyerId, tenantId, inspectableOnly === 'true');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a wanted vehicle preference for a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() dto: CreateBuyerVehiclePreferenceDto,
  ) {
    return this.service.create(buyerId, tenantId, userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wanted vehicle preference' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBuyerVehiclePreferenceDto,
  ) {
    return this.service.update(id, buyerId, tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a wanted vehicle preference' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  remove(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(id, buyerId, tenantId);
  }
}

@ApiTags('Buyer Vehicle Preferences')
@Controller('buyers/:buyerId/match-exclusions')
export class BuyerMatchExclusionsController {
  constructor(private readonly service: BuyerVehiclePreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'List dismissed lot numbers for a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiResponse({ status: HttpStatus.OK })
  list(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.service.listExclusions(buyerId, tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Dismiss (exclude) a lot from the buyer matching list' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  add(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() dto: CreateBuyerMatchExclusionDto,
  ) {
    return this.service.addExclusion(buyerId, tenantId, dto.lotNumber, userId ?? null);
  }

  @Delete('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset all exclusions for a buyer (restores original matching)' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  reset(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.service.resetExclusions(buyerId, tenantId);
  }

  @Delete(':lotNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Un-dismiss a single lot from the exclusion list' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'lotNumber', description: 'Lot number (numeric string)' })
  removeSingle(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('lotNumber') lotNumber: string,
  ) {
    return this.service.removeExclusion(buyerId, tenantId, lotNumber);
  }
}
