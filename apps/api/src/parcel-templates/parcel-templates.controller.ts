import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant } from '@htownautos/auth';
import { ParcelTemplatesService } from './parcel-templates.service';
import { CreateParcelTemplateDto, UpdateParcelTemplateDto } from './dto/parcel-template.dto';

@ApiTags('Parcel Templates')
@ApiBearerAuth()
@Controller('parcel-templates')
export class ParcelTemplatesController {
  constructor(private readonly service: ParcelTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List parcel templates (custom + UPS carrier)' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get('recommend')
  @ApiOperation({ summary: 'Recommend smallest fitting parcel for dimensions + weight' })
  recommend(
    @CurrentTenant() tenantId: string,
    @Query('length') length: string,
    @Query('width') width: string,
    @Query('height') height: string,
    @Query('weight') weight: string,
  ) {
    return this.service.recommend(tenantId, {
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      height: parseFloat(height) || 0,
      weight: parseFloat(weight) || 0,
    });
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create custom parcel template' })
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateParcelTemplateDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParcelTemplateDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
