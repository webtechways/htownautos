import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { YardSource } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateYardDto {
  @ApiProperty({ enum: YardSource, example: YardSource.COPART })
  @IsEnum(YardSource)
  source!: YardSource;

  @ApiProperty({ description: "Yard's number in the source auction system", example: 166 })
  @IsInt()
  @Min(1)
  yardNumber!: number;

  @ApiProperty({ description: 'Display name', example: 'OH - DAYTON' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  address?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: '2-letter state code', example: 'OH' })
  @IsOptional() @IsString() @MaxLength(10)
  state?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20)
  zip?: string;

  @ApiPropertyOptional({ default: 'US' }) @IsOptional() @IsString() @MaxLength(10)
  country?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-90) @Max(90)
  latitude?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-180) @Max(180)
  longitude?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(200)
  email?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200)
  contactName?: string;

  @ApiPropertyOptional({ description: 'Whether we perform physical inspections at this yard', default: false })
  @IsOptional() @IsBoolean()
  physicalInspectionAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Opening hours JSON (free-form)', example: { mon: '9-17' } })
  @IsOptional() @IsObject()
  hours?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional() @IsString() @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
