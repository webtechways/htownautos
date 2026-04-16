import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Manifests')
@ApiBearerAuth()
@Controller('shippo/manifests')
export class ShippoManifestsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List manifests' })
  list(@Query('page') page?: string, @Query('results') results?: string) {
    return this.shippo.listManifests(
      page ? parseInt(page) : undefined,
      results ? parseInt(results) : undefined,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create an end-of-day manifest' })
  create(@Body() body: {
    carrierAccount: string;
    shipmentDate: string;
    transactions: string[];
    addressFrom: Record<string, unknown> | string;
    metadata?: string;
  }) {
    return this.shippo.createManifest(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.shippo.getManifest(id);
  }
}
