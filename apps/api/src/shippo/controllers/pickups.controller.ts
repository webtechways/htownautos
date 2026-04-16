import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Pickups')
@ApiBearerAuth()
@Controller('shippo/pickups')
export class ShippoPickupsController {
  constructor(private readonly shippo: ShippoService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a carrier pickup' })
  create(@Body() body: {
    carrierAccount: string;
    location: Record<string, unknown>;
    transactions: string[];
    requestedStartTime: string;
    requestedEndTime: string;
    isTest?: boolean;
    metadata?: string;
  }) {
    return this.shippo.createPickup(body);
  }
}
