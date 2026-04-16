import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Orders')
@ApiBearerAuth()
@Controller('shippo/orders')
export class ShippoOrdersController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List Shippo orders' })
  list(
    @Query('page') page?: string,
    @Query('results') results?: string,
    @Query('orderStatus') orderStatus?: string,
    @Query('shopApp') shopApp?: string,
  ) {
    return this.shippo.listOrders({
      page: page ? parseInt(page) : undefined,
      results: results ? parseInt(results) : undefined,
      orderStatus: orderStatus ? orderStatus.split(',') : undefined,
      shopApp,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a Shippo order' })
  create(@Body() body: Record<string, unknown>) {
    return this.shippo.createOrder(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.shippo.getOrder(id);
  }
}
