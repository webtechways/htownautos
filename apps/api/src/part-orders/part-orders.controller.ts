import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant, CurrentUser } from '@htownautos/auth';
import { PartOrdersService } from './part-orders.service';
import { CreateOrderDto, UpdateOrderDto, CreateShipmentDto, BuyLabelDto, ChargeOrderDto, EstimateShippingDto } from './dto/order.dto';

@ApiTags('Part Orders')
@ApiBearerAuth()
@Controller('part-orders')
export class PartOrdersController {
  constructor(private readonly service: PartOrdersService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('buyerId') buyerId?: string,
  ) {
    return this.service.findAll(tenantId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      search,
      buyerId,
    });
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order (defaults to draft status)' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateOrderDto,
  ) {
    return this.service.create(tenantId, dto, user?.id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancel(tenantId, id);
  }

  @Delete('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete draft orders' })
  removeBulk(
    @CurrentTenant() tenantId: string,
    @Body() body: { ids: string[] },
  ) {
    return this.service.removeBulk(tenantId, body.ids);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }

  // ── Payment ─────────────────────────────────────────────

  @Post(':id/charge')
  @ApiOperation({ summary: 'Charge the order via Stripe (direct or payment link)' })
  charge(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChargeOrderDto,
  ) {
    return this.service.charge(tenantId, id, dto, user?.id);
  }

  @Post(':id/mark-paid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as paid manually (cash, check, etc.)' })
  markPaid(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { method?: string },
  ) {
    return this.service.markPaid(tenantId, id, body?.method);
  }

  // ── Shipping ────────────────────────────────────────────

  @Post('estimate-shipping')
  @ApiOperation({ summary: 'Estimate shipping cost for an address + items (no order needed)' })
  estimateShipping(
    @CurrentTenant() tenantId: string,
    @Body() dto: EstimateShippingDto,
  ) {
    return this.service.estimateShipping(tenantId, dto);
  }

  @Post(':id/rates')
  @ApiOperation({ summary: 'Get UPS shipping rates for an order' })
  getRates(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.service.getRates(tenantId, id, dto);
  }

  @Post(':id/buy-label')
  @ApiOperation({ summary: 'Purchase a UPS shipping label' })
  buyLabel(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BuyLabelDto & CreateShipmentDto & { parcelTemplateId?: string },
  ) {
    const { rateId, ...shipmentContext } = dto;
    return this.service.buyLabel(tenantId, id, rateId, shipmentContext);
  }

  @Post(':id/shipments/:shipmentId/refresh-tracking')
  @HttpCode(HttpStatus.OK)
  refreshTracking(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
  ) {
    return this.service.refreshTracking(tenantId, id, shipmentId);
  }
}
