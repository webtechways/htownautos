import {
  IsIn,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Nested DTOs ─────────────────────────────────────────────────────────────

export class BrokerFeeDto {
  @ApiProperty({ description: 'Flat broker fee floor (dollars)', example: 0 })
  @IsNumber()
  @Min(0)
  fixed!: number;

  @ApiProperty({ description: 'Broker percentage of highBid (0–100)', example: 0 })
  @IsNumber()
  @Min(0)
  pct!: number;
}

export class BiddingFeeRowDto {
  @ApiProperty({ description: 'Lower bound of bid range (inclusive)', example: 0 })
  @IsNumber()
  @Min(0)
  min!: number;

  @ApiPropertyOptional({ description: 'Upper bound of bid range (inclusive); null = no upper bound', example: 49.99, nullable: true })
  @IsOptional()
  max!: number | null;

  @ApiProperty({ description: 'clean + secured value (flat $ or "N%" string)', example: 25 })
  cs!: number | string;

  @ApiProperty({ description: 'clean + unsecured value', example: 27.5 })
  cu!: number | string;

  @ApiProperty({ description: 'nonClean + secured value', example: 25 })
  ns!: number | string;

  @ApiProperty({ description: 'nonClean + unsecured value', example: 27.5 })
  nu!: number | string;
}

export class BiddingFeeTableDto {
  @ApiProperty({ type: [BiddingFeeRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BiddingFeeRowDto)
  rows!: BiddingFeeRowDto[];
}

// ── Root DTO ─────────────────────────────────────────────────────────────────

export class UpdateFeeConfigDto {
  @ApiProperty({ enum: ['secured', 'unsecured'], description: 'Default payment method' })
  @IsIn(['secured', 'unsecured'])
  paymentMethod!: 'secured' | 'unsecured';

  @ApiProperty({ description: 'Gate fee in dollars', example: 95 })
  @IsNumber()
  @Min(0)
  gateFee!: number;

  @ApiProperty({ description: 'Environmental fee in dollars', example: 15 })
  @IsNumber()
  @Min(0)
  environmentalFee!: number;

  @ApiProperty({ type: BrokerFeeDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BrokerFeeDto)
  broker!: BrokerFeeDto;

  @ApiProperty({ type: BiddingFeeTableDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BiddingFeeTableDto)
  biddingFee!: BiddingFeeTableDto;
}
