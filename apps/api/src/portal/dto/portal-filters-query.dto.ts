import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PortalFiltersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  trim?: string;
}
