import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Tracks')
@ApiBearerAuth()
@Controller('shippo/tracks')
export class ShippoTracksController {
  constructor(private readonly shippo: ShippoService) {}

  @Post()
  @ApiOperation({ summary: 'Register a tracking number (enables webhooks)' })
  register(@Body() body: { carrier: string; trackingNumber: string; metadata?: string }) {
    return this.shippo.registerTracking(body.carrier, body.trackingNumber, body.metadata);
  }

  @Get(':carrier/:trackingNumber')
  @ApiOperation({ summary: 'Get tracking status' })
  get(@Param('carrier') carrier: string, @Param('trackingNumber') trackingNumber: string) {
    return this.shippo.getTracking(carrier, trackingNumber);
  }
}
