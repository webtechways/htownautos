import { Body, Controller, Delete, Get, Post, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Rates at Checkout')
@ApiBearerAuth()
@Controller('shippo/rates-at-checkout')
export class ShippoRatesAtCheckoutController {
  constructor(private readonly shippo: ShippoService) {}

  @Post('live-rates')
  @ApiOperation({ summary: 'Create live rates for cart checkout' })
  createLiveRates(@Body() body: Record<string, unknown>) {
    return this.shippo.createLiveRates(body);
  }

  @Get('default-parcel-template')
  @ApiOperation({ summary: 'Get the default parcel template for live rates' })
  getDefault() {
    return this.shippo.getDefaultParcelTemplate();
  }

  @Put('default-parcel-template')
  @ApiOperation({ summary: 'Set the default parcel template for live rates' })
  setDefault(@Body() body: Record<string, unknown>) {
    return this.shippo.updateDefaultParcelTemplate(body);
  }

  @Delete('default-parcel-template')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove the default parcel template for live rates' })
  deleteDefault() {
    return this.shippo.deleteDefaultParcelTemplate();
  }
}
