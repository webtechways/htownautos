import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Refunds')
@ApiBearerAuth()
@Controller('shippo/refunds')
export class ShippoRefundsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List refunds' })
  list(@Query('page') page?: string, @Query('results') results?: string) {
    return this.shippo.listRefunds({
      page: page ? parseInt(page) : undefined,
      results: results ? parseInt(results) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Refund / void a label by transaction id' })
  create(@Body() body: { transactionId?: string; transaction?: string }) {
    const tx = body.transactionId ?? body.transaction;
    if (!tx) {
      throw new BadRequestException(
        'Missing required field: transactionId (or transaction)',
      );
    }
    return this.shippo.refundLabel(tx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a refund' })
  get(@Param('id') id: string) {
    return this.shippo.getRefund(id);
  }
}
