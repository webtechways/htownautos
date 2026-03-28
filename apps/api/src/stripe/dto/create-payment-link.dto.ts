import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty, IsIn, Min } from 'class-validator';

export class CreatePaymentLinkDto {
  @ApiProperty({
    description: 'Amount in cents (e.g., 5000 = $50.00)',
    example: 5000,
  })
  @IsInt()
  @Min(50) // Stripe minimum is $0.50
  amount: number;

  @ApiProperty({
    description: 'Charge description shown in Stripe',
    example: 'Down payment for 2024 Toyota Camry',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Message note sent to the customer along with the link',
    example: 'Hi! Please use this link to complete your payment.',
  })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({
    description: 'Delivery method for the payment link',
    enum: ['sms', 'email'],
    example: 'sms',
  })
  @IsIn(['sms', 'email'])
  deliveryMethod: 'sms' | 'email';
}
