import { Body, Controller, Get, Param, Post, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ShippoService } from '../shippo.service';

class CreateShippoAddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
  @ApiProperty() @IsString() street1!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() street2?: string;
  @ApiProperty() @IsString() city!: string;
  @ApiProperty() @IsString() state!: string;
  @ApiProperty() @IsString() zip!: string;
  @ApiPropertyOptional({ default: 'US' }) @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isResidential?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() validate?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() metadata?: string;
}

class ValidateAddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
  @ApiProperty() @IsString() street1!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() street2?: string;
  @ApiProperty() @IsString() city!: string;
  @ApiProperty() @IsString() state!: string;
  @ApiProperty() @IsString() zip!: string;
  @ApiPropertyOptional({ default: 'US' }) @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
}

@ApiTags('Shippo · Addresses')
@ApiBearerAuth()
@Controller('shippo/addresses')
export class ShippoAddressesController {
  constructor(private readonly shippo: ShippoService) {}

  @Get()
  @ApiOperation({ summary: 'List addresses' })
  list(@Query('page') page?: string, @Query('results') results?: string) {
    return this.shippo.listAddresses(
      page ? parseInt(page) : undefined,
      results ? parseInt(results) : undefined,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create an address' })
  create(@Body() dto: CreateShippoAddressDto) {
    return this.shippo.createAddress(dto as any);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an address (create + validate in one call)' })
  validate(@Body() dto: ValidateAddressDto) {
    return this.shippo.validateAddress(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an address' })
  get(@Param('id') id: string) {
    return this.shippo.getAddress(id);
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an existing address by id' })
  validateById(@Param('id') id: string) {
    return this.shippo.validateAddressById(id);
  }
}
