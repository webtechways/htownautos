import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { VehicleInspectionStatus } from '@prisma/client';

export class CreateVehicleInspectionDto {
  @IsString()
  @MinLength(11) // VINs are 17 chars; allow short forms for partial entries but require something
  vin!: string;

  @IsOptional()
  @IsString()
  lotNumber?: string;

  @IsOptional()
  @IsString()
  yardName?: string;

  @IsOptional()
  @IsString()
  yardNumber?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsUUID()
  buyerId?: string;

  @IsOptional()
  @IsEnum(VehicleInspectionStatus)
  status?: VehicleInspectionStatus;

  @IsOptional()
  @IsString()
  specificRequest?: string;

  /** Deadline: ISO timestamp by when the inspection must be completed. */
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsDateString()
  inspectedAt?: string;

  @IsOptional()
  @IsUUID()
  inspectorId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  marketPrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
