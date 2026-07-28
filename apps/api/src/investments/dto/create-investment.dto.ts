import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export const INVESTMENT_SOURCES = [
  'CREDIT_CARD',
  'CREDIT_LINE',
  'CAPITAL_FRIEND',
  'LOAN',
  'INVESTOR_GUEST',
] as const;

export const PAYBACK_INTERVALS = [
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'ANNUAL',
  'ONE_TIME',
] as const;

export class CreateInvestmentDto {
  @ApiProperty({ description: 'Amount invested', example: 5000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Funding source',
    enum: INVESTMENT_SOURCES,
    example: 'CREDIT_CARD',
  })
  @IsString()
  @IsIn(INVESTMENT_SOURCES as unknown as string[])
  source: string;

  @ApiPropertyOptional({
    description: 'Specific account / person the money came from',
    example: 'Chase Visa 1234',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sourceAccount?: string;

  @ApiPropertyOptional({ description: 'Total amount to pay back', example: 5600 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  payBackAmount?: number;

  @ApiPropertyOptional({
    description: 'Payback cadence',
    enum: PAYBACK_INTERVALS,
    example: 'MONTHLY',
  })
  @IsOptional()
  @IsString()
  @IsIn(PAYBACK_INTERVALS as unknown as string[])
  payBackInterval?: string;

  @ApiPropertyOptional({ description: 'Deadline to fully settle (ISO date)' })
  @IsOptional()
  @IsDateString()
  settleDeadline?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
