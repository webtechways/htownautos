import { IsOptional, IsString, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryCopartDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMax?: number;

  @IsOptional()
  @IsString()
  damageDescription?: string;

  @IsOptional()
  @IsString()
  saleStatus?: string;

  @IsOptional()
  @IsString()
  locationState?: string;

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  minOdometer?: number;

  @IsOptional()
  @Type(() => Number)
  maxOdometer?: number;

  @IsOptional()
  @IsString()
  hasKeys?: string;

  @IsOptional()
  @IsString()
  runsDrives?: string;

  @IsOptional()
  @IsString()
  saleTitleType?: string;

  @IsOptional()
  @IsString()
  titleCategory?: string; // comma-separated: clean,nonrepairable,salvage

  @IsOptional()
  @IsString()
  sellerCategory?: string; // comma-separated: Insurance,Rental,Repo,Other

  @IsOptional()
  @IsString()
  color?: string; // comma-separated

  @IsOptional()
  @IsString()
  cylinders?: string; // comma-separated

  @IsOptional()
  @IsString()
  drive?: string; // comma-separated (drivetrain)

  @IsOptional()
  @IsString()
  bodyStyle?: string; // comma-separated

  @IsOptional()
  @IsString()
  fuelType?: string; // comma-separated

  @IsOptional()
  @IsString()
  transmission?: string; // comma-separated

  @IsOptional()
  @Type(() => Number)
  engineSizeMin?: number;

  @IsOptional()
  @Type(() => Number)
  engineSizeMax?: number;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @Type(() => Number)
  radius?: number;

  @IsOptional()
  @IsString()
  trim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  saleDateFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  saleDateTo?: number;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  ids?: string; // Comma-separated list of IDs to filter by (for favorites)

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inspectableOnly?: boolean; // Only listings whose yard offers on-site inspection

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  runsAndDrives?: boolean; // true = only "Run and Drive" vehicles (excludes "Does Not Run")
}
