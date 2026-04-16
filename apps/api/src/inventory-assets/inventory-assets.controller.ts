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

  @Post('analyze-url')
  @ApiOperation({ summary: 'Analyze a product URL with AI to extract asset info' })
  @ApiResponse({ status: 200, description: 'Analysis result with product details and images' })
  analyzeUrl(@Body() body: { url: string }) {
    return this.service.analyzeUrl(body.url);
  }

  @Post('analyze-images')
  @ApiOperation({ summary: 'Analyze asset images with AI to extract product info' })
  @ApiResponse({ status: 200, description: 'Analysis result' })
  analyzeImages(@Body() body: { mediaIds: string[] }) {
    return this.service.analyzeImages(body.mediaIds);
  }

  @Post('analyze-receipt-items')
  @ApiOperation({ summary: 'Analyze receipt images and extract individual line items' })
  @ApiResponse({ status: 200, description: 'Receipt data with individual items array' })
  analyzeReceiptItems(@Body() body: { mediaIds: string[] }) {
    return this.service.analyzeReceiptItems(body.mediaIds);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple inventory assets at once' })
  @ApiResponse({ status: 201, description: 'Assets created successfully' })
  bulkCreate(
    @CurrentTenant() tenantId: string,
    @Body() body: { assets: CreateInventoryAssetDto[] },
  ) {
    return this.service.bulkCreate(tenantId, body.assets);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get inventory asset stats (total items and value)' })
  @ApiResponse({ status: 200, description: 'Stats' })
  getStats(@CurrentTenant() tenantId: string) {
    return this.service.getStats(tenantId);
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
