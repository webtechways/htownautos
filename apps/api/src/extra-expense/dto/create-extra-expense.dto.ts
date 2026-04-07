import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExtraExpenseDto {
  @ApiProperty({
    description: 'Vehicle UUID (required foreign key)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({
    description: 'Expense description',
    example: 'New tires',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Price amount',
    example: 450.00,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Shipping cost',
    example: 25.00,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional({
    description: 'Tax amount',
    example: 36.00,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({
    description: 'Array of receipt media UUIDs',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  receiptIds?: string[];

  @ApiPropertyOptional({
    description: 'UUID of the user who paid for this expense',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  paidByUserId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata (e.g. line items)',
    example: { items: [{ description: 'Oil change', price: 45 }] },
  })
  @IsOptional()
  @IsObject()
  metaValue?: Record<string, any>;
}
