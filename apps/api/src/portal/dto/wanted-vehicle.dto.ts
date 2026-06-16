import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class WantedVehicleDto {
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearFrom?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearTo?: number;

  @IsString()
  @MinLength(1)
  make!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  models?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trims?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  maxMileage?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxCost?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  titleTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
