import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class AnalyzeReceiptsDto {
  @ApiProperty({
    description: 'Array of receipt media UUIDs to analyze',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  receiptIds: string[];
}

export interface AnalyzeReceiptsResult {
  description: string;
  items: { item: string; amount: number }[];
  shippingCost: number;
  tax: number;
  total: number;
}
