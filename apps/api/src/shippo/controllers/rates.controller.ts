import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Rates')
@ApiBearerAuth()
@Controller('shippo/rates')
export class ShippoRatesController {
  constructor(private readonly shippo: ShippoService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a rate' })
  get(@Param('id') id: string) {
    return this.shippo.getRate(id);
  }
}
