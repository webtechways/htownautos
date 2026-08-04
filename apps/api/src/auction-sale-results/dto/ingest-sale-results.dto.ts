import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * One post-sale outcome as scraped from the live-sale page. Field names mirror
 * the incoming payload exactly (`auction`, `lot`, `bid`, `order`, `asking`…).
 * Only `lot` is truly required; everything else is best-effort.
 */
export class SaleResultItemDto {
  @ApiProperty({ example: 62813626, description: 'Copart lot number' })
  @Type(() => Number)
  @IsNumber()
  lot!: number;

  @ApiPropertyOptional({ example: 'copart-882-a' })
  @IsOptional() @IsString()
  auction?: string;

  @ApiPropertyOptional({ example: 1650, description: 'Final / high bid reached' })
  @IsOptional() @Type(() => Number) @IsNumber()
  bid?: number;

  @ApiPropertyOptional({ example: 1700, description: 'Asking price' })
  @IsOptional() @Type(() => Number) @IsNumber()
  asking?: number;

  @ApiPropertyOptional({ example: 1, description: 'Running order in the sale' })
  @IsOptional() @Type(() => Number) @IsInt()
  order?: number;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  reserve?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  sold?: boolean;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt()
  ticks?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt()
  round?: number;

  @ApiPropertyOptional({ example: 'event' })
  @IsOptional() @IsString()
  event?: string;

  @ApiPropertyOptional({ example: '2026-08-04T01:42:25.056Z' })
  @IsOptional() @IsString()
  receivedAt?: string;

  @ApiPropertyOptional({
    example:
      'https://www.autobidmaster.com/en/search/sale-location-id-ncs-mountain_region/sale-date-20260803/',
  })
  @IsOptional() @IsString()
  pageUrl?: string;
}

/**
 * Wrapper payload. The scraper posts `{ body: [ …items ] }`. A bare array is
 * also accepted by the controller (normalized before validation).
 */
export class IngestSaleResultsDto {
  @ApiProperty({ type: [SaleResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleResultItemDto)
  body!: SaleResultItemDto[];
}
