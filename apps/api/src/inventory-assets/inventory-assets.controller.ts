import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryAssetsService } from './inventory-assets.service';
import {
  CreateInventoryAssetDto,
  UpdateInventoryAssetDto,
  QueryInventoryAssetDto,
} from './dto';
import { CurrentTenant } from '@htownautos/auth';

@ApiTags('Inventory Assets')
@ApiBearerAuth()
@Controller('inventory-assets')
export class InventoryAssetsController {
  constructor(private readonly service: InventoryAssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateInventoryAssetDto,
  ) {
    return this.service.create(tenantId, dto);
  }

  @Post('analyze-images')
  @ApiOperation({ summary: 'Analyze asset images with AI to extract product info' })
  @ApiResponse({ status: 200, description: 'Analysis result' })
  analyzeImages(@Body() body: { mediaIds: string[] }) {
    return this.service.analyzeImages(body.mediaIds);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory assets' })
  @ApiResponse({ status: 200, description: 'List of inventory assets' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryInventoryAssetDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inventory asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryAssetDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an inventory asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(tenantId, id);
  }
}
