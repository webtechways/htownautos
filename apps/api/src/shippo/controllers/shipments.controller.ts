import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Shipments')
@ApiBearerAuth()
@Controller('shippo/shipments')
export class ShippoShipmentsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List shipments' })
  list(
    @Query('page') page?: string,
    @Query('results') results?: string,
    @Query('objectCreatedGte') objectCreatedGte?: string,
    @Query('objectCreatedLte') objectCreatedLte?: string,
  ) {
    return this.shippo.listShipments({
      page: page ? parseInt(page) : undefined,
      results: results ? parseInt(results) : undefined,
      objectCreatedGte,
      objectCreatedLte,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a shipment (raw SDK shape)' })
  create(@Body() body: Record<string, unknown>) {
    return this.shippo.createShipmentRaw(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a shipment' })
  get(@Param('id') id: string) {
    return this.shippo.getShipment(id);
  }

  @Get(':id/rates')
  @ApiOperation({ summary: 'List rates for a shipment' })
  rates(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('results') results?: string,
  ) {
    return this.shippo.listShipmentRates(
      id,
      page ? parseInt(page) : undefined,
      results ? parseInt(results) : undefined,
    );
  }

  @Get(':id/rates/:currency')
  @ApiOperation({ summary: 'List rates for a shipment converted to a currency' })
  ratesByCurrency(
    @Param('id') id: string,
    @Param('currency') currency: string,
    @Query('page') page?: string,
    @Query('results') results?: string,
  ) {
    return this.shippo.listShipmentRatesByCurrencyCode(
      id,
      currency,
      page ? parseInt(page) : undefined,
      results ? parseInt(results) : undefined,
    );
  }
}
