import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Transactions (Labels)')
@ApiBearerAuth()
@Controller('shippo/transactions')
export class ShippoTransactionsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions (labels)' })
  list(
    @Query('page') page?: string,
    @Query('results') results?: string,
    @Query('rate') rate?: string,
    @Query('trackingNumber') trackingNumber?: string,
    @Query('objectStatus') objectStatus?: string,
  ) {
    return this.shippo.listTransactions({
      page: page ? parseInt(page) : undefined,
      results: results ? parseInt(results) : undefined,
      rate,
      trackingNumber,
      objectStatus,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Buy a label — accepts either { rateId, labelFileType } or a full instant body' })
  create(@Body() body: { rateId?: string; rate?: string; labelFileType?: any } & Record<string, unknown>) {
    if (body.rateId || body.rate) {
      const rateId = (body.rateId ?? body.rate) as string;
      return this.shippo.buyLabel(rateId, body.labelFileType || 'PDF');
    }
    return this.shippo.createTransaction(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a transaction' })
  get(@Param('id') id: string) {
    return this.shippo.getTransaction(id);
  }
}
