import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty()
  @IsUUID()
  partId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Override unit price (defaults to part.price)' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

export class ShipToAddressDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() street1: string;
  @ApiPropertyOptional() @IsOptional() @IsString() street2?: string;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() state: string;
  @ApiProperty() @IsString() zip: string;
  @ApiProperty() @IsString() country: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
}

export class CreateOrderDto {
  @ApiProperty() @IsUUID()
  buyerId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsNumber() @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsNumber() @Min(0)
  discount?: number;

  @ApiPropertyOptional({ enum: ['pickup', 'ship'] })
  @IsOptional() @IsString()
  shippingMethod?: 'pickup' | 'ship';

  @ApiPropertyOptional()
  @IsOptional() @ValidateNested() @Type(() => ShipToAddressDto)
  shipTo?: ShipToAddressDto;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ type: [OrderItemDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @Min(0)
  taxRate?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @Min(0)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  shippingMethod?: string;

  @ApiPropertyOptional()
  @IsOptional() @ValidateNested() @Type(() => ShipToAddressDto)
  shipTo?: ShipToAddressDto;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  status?: string;
}

export class CreateShipmentDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID()
  parcelTemplateId?: string;

  @ApiProperty() @IsNumber() length: number;
  @ApiProperty() @IsNumber() width: number;
  @ApiProperty() @IsNumber() height: number;
  @ApiPropertyOptional({ default: 'in' }) @IsOptional() @IsString() distanceUnit?: string;
  @ApiProperty() @IsNumber() weight: number;
  @ApiPropertyOptional({ default: 'lb' }) @IsOptional() @IsString() massUnit?: string;
}

export class BuyLabelDto {
  @ApiProperty() @IsString() rateId: string;
}

export class EstimateShippingDto {
  @ApiProperty() @ValidateNested() @Type(() => ShipToAddressDto)
  shipTo: ShipToAddressDto;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class ChargeOrderDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional({ enum: ['charge', 'send_link_sms', 'send_link_email'] })
  @IsOptional() @IsEnum(['charge', 'send_link_sms', 'send_link_email'])
  mode?: 'charge' | 'send_link_sms' | 'send_link_email';
}
