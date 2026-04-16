import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Shippo integration' })
  @IsString() @MinLength(2) @MaxLength(80)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Array of scope strings "resource:action" (e.g. "orders:read", "shippo:write"). Invalid scopes are rejected.',
    example: ['orders:read', 'shippo:write'],
  })
  @IsArray() @ArrayNotEmpty() @IsString({ each: true })
  scopes!: string[];

  @ApiPropertyOptional({ description: 'Optional ISO timestamp when the key should expire' })
  @IsOptional() @IsDateString()
  expiresAt?: string;
}

export class UpdateApiKeyDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  expiresAt?: string | null;
}
