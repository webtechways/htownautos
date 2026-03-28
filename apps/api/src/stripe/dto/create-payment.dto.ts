import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Amount in cents (e.g., 5000 = $50.00)', example: 5000 })
  @IsInt()
  @Min(50) // Stripe minimum is $0.50
  amount: number;

  @ApiProperty({ description: 'Payment description', example: 'Down payment for 2024 Toyota Camry' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Payment method ID (uses default if not provided)' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
