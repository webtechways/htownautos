import { ApiPropertyOptional } from '@nestjs/swagger';
import { YardSource } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryYardsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 50, maximum: 200 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by name (case-insensitive contains)' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: YardSource })
  @IsOptional() @IsEnum(YardSource)
  source?: YardSource;

  @ApiPropertyOptional({ description: '2-letter state code, e.g. OH' })
  @IsOptional() @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Filter by physicalInspectionAvailable' })
  @IsOptional() @Type(() => Boolean) @IsBoolean()
  physicalInspectionAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Filter by isActive' })
  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by exact yardNumber (used with source)' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  yardNumber?: number;
}
