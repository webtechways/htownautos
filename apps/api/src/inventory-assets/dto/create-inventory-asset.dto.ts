import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryAssetDto {
  @ApiProperty({
    description: 'Name of the asset',
    example: 'Milwaukee Impact Wrench',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Internal asset tag / identifier',
    example: 'HTW-A-000001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assetTag?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer serial number',
    example: 'SN-12345678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Category of the asset',
    example: 'tool',
    enum: ['tool', 'equipment', 'furniture', 'electronics', 'vehicle_accessory', 'other'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    description: 'Current status',
    default: 'available',
    enum: ['available', 'in_use', 'maintenance', 'retired', 'lost'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['available', 'in_use', 'maintenance', 'retired', 'lost'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Current condition',
    default: 'good',
    enum: ['new', 'good', 'fair', 'poor'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['new', 'good', 'fair', 'poor'])
  condition?: string;

  @ApiPropertyOptional({
    description: 'Physical location (room, shelf, etc.)',
    example: 'Shop - Bay 3',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Person currently assigned to',
    example: 'John Smith',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Brand name', example: 'Milwaukee' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ description: 'Model name/number', example: '2767-20' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional({ description: 'Date of purchase' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Purchase price', example: 349.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'Current estimated value', example: 200.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  currentValue?: number;

  @ApiPropertyOptional({ description: 'Warranty expiration date' })
  @IsOptional()
  @IsDateString()
  warrantyExpiry?: string;

  @ApiPropertyOptional({ description: 'Supplier / vendor name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  supplier?: string;

  @ApiPropertyOptional({ description: 'Quantity', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Shipping cost', example: 15.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  shippingCost?: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 28.50 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  tax?: number;

  @ApiPropertyOptional({ description: 'Receipt media IDs' })
  @IsOptional()
  @IsString({ each: true })
  receiptIds?: string[];

  @ApiPropertyOptional({ description: 'Image URL for the asset' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
