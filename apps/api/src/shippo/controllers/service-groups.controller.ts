import { Body, Controller, Delete, Get, Param, Patch, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShippoService } from '../shippo.service';

@ApiTags('Shippo · Service Groups')
@ApiBearerAuth()
@Controller('shippo/service-groups')
export class ShippoServiceGroupsController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List service groups' })
  list() {
    return this.shippo.listServiceGroups();
  }

  @Post()
  @ApiOperation({ summary: 'Create a service group' })
  create(@Body() body: Record<string, unknown>) {
    return this.shippo.createServiceGroup(body);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a service group (Shippo update takes the object in body)' })
  update(@Body() body: Record<string, unknown>) {
    return this.shippo.updateServiceGroup(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.shippo.deleteServiceGroup(id);
  }
}
