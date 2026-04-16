import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Parcels')
@ApiBearerAuth()
@Controller('shippo/parcels')
export class ShippoParcelsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List parcels' })
  list(@Query('page') page?: string, @Query('results') results?: string) {
    return this.shippo.listParcels(
      page ? parseInt(page) : undefined,
      results ? parseInt(results) : undefined,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a parcel' })
  create(@Body() body: Record<string, unknown>) {
    return this.shippo.createParcel(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a parcel' })
  get(@Param('id') id: string) {
    return this.shippo.getParcel(id);
  }
}
