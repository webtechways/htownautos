import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExtraExpense, Media } from '@prisma/client';

export class ExtraExpenseEntity implements Omit<ExtraExpense, 'price' | 'shippingCost' | 'tax'> {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  vehicleId: string;

  @ApiProperty({ example: 'New tires' })
  description: string;

  @ApiProperty({ example: 450.0, type: Number })
  price: number;

  @ApiProperty({ example: 25.0, type: Number })
  shippingCost: number;

  @ApiProperty({ example: 36.0, type: Number })
  tax: number;

  @ApiPropertyOptional({ description: 'Receipt images', type: 'array' })
  receipts?: Media[];

  @ApiProperty({ example: '2024-01-12T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-12T10:30:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional()
  metaValue: any;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174003' })
  tenantId: string | null;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174002' })
  paidByUserId: string | null;

  @ApiPropertyOptional({ description: 'User who paid for this expense' })
  paidByUser?: any;

  constructor(partial: Partial<ExtraExpenseEntity> & { price?: any; shippingCost?: any; tax?: any }) {
    Object.assign(this, partial);
    if (partial.price !== undefined) {
      this.price = Number(partial.price);
    }
    if (partial.shippingCost !== undefined) {
      this.shippingCost = Number(partial.shippingCost);
    }
    if (partial.tax !== undefined) {
      this.tax = Number(partial.tax);
    }
  }
}
