import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty, IsIn, IsOptional, Min } from 'class-validator';

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
    description:
      'Message note sent to the customer along with the link. Not required ' +
      "when deliveryMethod is 'link' (generate-only, nothing is sent).",
    example: 'Hi! Please use this link to complete your payment.',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description:
      "Delivery method. 'sms'/'email' send the link to the customer; " +
      "'link' only generates the URL and returns it (staff copies/sends it manually).",
    enum: ['sms', 'email', 'link'],
    example: 'sms',
  })
  @IsIn(['sms', 'email', 'link'])
  deliveryMethod: 'sms' | 'email' | 'link';
}
