import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { VehicleInspectionStatus } from '@prisma/client';

export class ListVehicleInspectionsDto {
  @IsOptional() @IsUUID() buyerId?: string;
  @IsOptional() @IsUUID() vehicleId?: string;

  @IsOptional() @IsEnum(VehicleInspectionStatus)
  status?: VehicleInspectionStatus;

  @IsOptional() @IsString() vin?: string;
  @IsOptional() @IsString() lotNumber?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number;
}
