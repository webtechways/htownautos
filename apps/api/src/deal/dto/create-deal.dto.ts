import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DealType {
  FINANCE = 'finance',
  BHPH = 'bhph',
  CASH = 'cash',
  WHOLESALE = 'wholesale',
  OUTSIDE_FINANCE = 'outside_finance',
}

export class CreateDealDto {
  @ApiProperty({ enum: DealType })
  @IsEnum(DealType)
  dealType: DealType;

  @ApiProperty()
  @IsUUID()
  buyerId: string;

  @ApiProperty()
  @IsUUID()
  vehicleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  coBuyerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dealStatusId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  financeTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dealDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  // Pricing
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vehiclePrice: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rebate?: number;

  // Fees
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salesTax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  docFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  titleFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  registrationFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  otherFees?: number;

  // Finance
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  downPayment?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  apr?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  term?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monthlyPayment?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalOfPayments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  financeCharge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lenderName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lenderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lenderRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dealerReserve?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  buyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sellRate?: number;

  // Trade-in
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTradeIn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tradeInYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeInMake?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeInModel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeInVin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tradeInMileage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tradeInActualValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tradeInAllowance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tradeInPayoff?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeInLienHolder?: string;

  // Products / VSC
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasWarranty?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warrantyProvider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  warrantyCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  warrantyTerm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  warrantyDeductible?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasGap?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gapProvider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gapCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasMaintenancePlan?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maintenanceProvider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maintenanceCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTheftProtection?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  theftProtectionCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPaintProtection?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paintProtectionCost?: number;

  // Credit / Compliance
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  creditCheckConsent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(300)
  @Max(850)
  creditScore?: number;

  // Personnel
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salesPersonId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salesManagerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  financeManagerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;
}
