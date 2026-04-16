import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Customs Items')
@ApiBearerAuth()
@Controller('shippo/customs-items')
export class ShippoCustomsItemsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List customs items' })
  list(@Query('page') page?: string, @Query('results') results?: string) {
    return this.shippo.listCustomsItems(
      page ? parseInt(page) : undefined,
      results ? parseInt(results) : undefined,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a customs item' })
  create(@Body() body: Record<string, unknown>) {
    return this.shippo.createCustomsItem(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.shippo.getCustomsItem(id);
  }
}

@ApiTags('Shippo · Customs Declarations')
@ApiBearerAuth()
@Controller('shippo/customs-declarations')
export class ShippoCustomsDeclarationsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List customs declarations' })
  list(@Query('page') page?: string, @Query('results') results?: string) {
    return this.shippo.listCustomsDeclarations(
      page ? parseInt(page) : undefined,
      results ? parseInt(results) : undefined,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a customs declaration' })
  create(@Body() body: Record<string, unknown>) {
    return this.shippo.createCustomsDeclaration(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.shippo.getCustomsDeclaration(id);
  }
}
