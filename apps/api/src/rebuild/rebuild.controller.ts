import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RebuildService } from './rebuild.service';
import { CurrentTenant, CognitoJwtGuard } from '@htownautos/auth';
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

class CreateRebuildItemDto {
  @IsString()
  vehicleId: string;

  @IsString()
  side: string;

  @IsOptional()
  @IsString()
  damageDescription?: string;
}

class UpdateRebuildItemDto {
  @IsOptional()
  @IsString()
  side?: string;

  @IsOptional()
  @IsString()
  damageDescription?: string;

  @IsOptional()
  photosBefore?: any;

  @IsOptional()
  photosAfter?: any;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@ApiTags('Rebuild')
@Controller('rebuild-items')
@UseGuards(CognitoJwtGuard)
export class RebuildController {
  constructor(private readonly service: RebuildService) {}

  @Get()
  @ApiOperation({ summary: 'Get rebuild items for a vehicle' })
  async findByVehicle(@Query('vehicleId') vehicleId: string) {
    return this.service.findByVehicle(vehicleId);
  }

  @Post()
  @ApiOperation({ summary: 'Create rebuild item' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateRebuildItemDto) {
    return this.service.create(dto.vehicleId, { ...dto, tenantId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update rebuild item' })
  async update(@Param('id') id: string, @Body() dto: UpdateRebuildItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete rebuild item' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
