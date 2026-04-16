import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ShippoService } from './shippo.service';

/**
 * Legacy top-level Shippo controller. New endpoints live under
 * `src/shippo/controllers/*` — this file is kept so the existing
 * `/shippo/validate-address` route (used by the frontend address UI)
 * continues to work unchanged.
 */
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

@ApiTags('Shippo')
@ApiBearerAuth()
@Controller('shippo')
export class ShippoController {
  constructor(private readonly shippo: ShippoService) {}

  @Post('validate-address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an address with Shippo (legacy alias of /shippo/addresses/validate)' })
  validateAddress(@Body() dto: ValidateAddressDto) {
    return this.shippo.validateAddress(dto);
  }
}
