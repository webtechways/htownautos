import { Body, Controller, Delete, Get, Param, Patch, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Webhooks (Management)')
@ApiBearerAuth()
@Controller('shippo/webhooks-admin')
export class ShippoWebhooksAdminController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List Shippo webhook subscriptions' })
  list() {
    return this.shippo.listWebhooks();
  }

  @Post()
  @ApiOperation({ summary: 'Create a webhook subscription' })
  create(@Body() body: { url: string; eventType: string; isActive?: boolean }) {
    return this.shippo.createWebhook(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.shippo.getWebhook(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.shippo.updateWebhook(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.shippo.deleteWebhook(id);
  }
}
