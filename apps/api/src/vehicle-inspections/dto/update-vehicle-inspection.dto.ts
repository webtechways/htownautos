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
} from 'class-validator';
import { VehicleInspectionStatus } from '@prisma/client';

export class UpdateVehicleInspectionDto {
  @IsOptional() @IsString() vin?: string;
  @IsOptional() @IsString() lotNumber?: string;
  @IsOptional() @IsString() yardName?: string;
  @IsOptional() @IsString() yardNumber?: string;
  @IsOptional() @IsUUID() vehicleId?: string;
  @IsOptional() @IsUUID() buyerId?: string;

  @IsOptional() @IsEnum(VehicleInspectionStatus)
  status?: VehicleInspectionStatus;

  @IsOptional() @IsString() specificRequest?: string;
  @IsOptional() @IsDateString() inspectedAt?: string;
  @IsOptional() @IsDateString() completedAt?: string;
  @IsOptional() @IsUUID() inspectorId?: string;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  overallRating?: number;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 })
  marketPrice?: number;

  @IsOptional() @IsString() notes?: string;
}
