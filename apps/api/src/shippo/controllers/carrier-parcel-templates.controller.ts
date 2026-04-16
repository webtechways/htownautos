import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Carrier Parcel Templates')
@ApiBearerAuth()
@Controller('shippo/carrier-parcel-templates')
export class ShippoCarrierParcelTemplatesController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List carrier parcel templates' })
  @ApiQuery({ name: 'carrier', required: false })
  @ApiQuery({ name: 'include', required: false, enum: ['all', 'user', 'enabled'] })
  list(
    @Query('carrier') carrier?: string,
    @Query('include') include?: 'all' | 'user' | 'enabled',
  ) {
    return this.shippo.listCarrierParcelTemplates(carrier, include || 'all');
  }

  @Get(':token')
  @ApiOperation({ summary: 'Retrieve a carrier parcel template by token' })
  get(@Param('token') token: string) {
    return this.shippo.getCarrierParcelTemplate(token);
  }
}
