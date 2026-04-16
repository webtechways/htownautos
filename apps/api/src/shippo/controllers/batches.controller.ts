import { Body, Controller, Get, Param, Post, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Batches')
@ApiBearerAuth()
@Controller('shippo/batches')
export class ShippoBatchesController {
  constructor(private readonly shippo: ShippoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a batch' })
  create(@Body() body: Record<string, unknown>) {
    return this.shippo.createBatch(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a batch (paginates shipments)' })
  get(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('results') results?: string,
  ) {
    return this.shippo.getBatch(
      id,
      page ? parseInt(page) : undefined,
      results ? parseInt(results) : undefined,
    );
  }

  @Post(':id/add-shipments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add shipments to a batch' })
  addShipments(@Param('id') id: string, @Body() body: Array<Record<string, unknown>>) {
    return this.shippo.addShipmentsToBatch(id, body);
  }

  @Post(':id/remove-shipments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove shipments from a batch' })
  removeShipments(@Param('id') id: string, @Body() body: string[]) {
    return this.shippo.removeShipmentsFromBatch(id, body);
  }

  @Post(':id/purchase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Purchase all labels in a batch' })
  purchase(@Param('id') id: string) {
    return this.shippo.purchaseBatch(id);
  }
}
