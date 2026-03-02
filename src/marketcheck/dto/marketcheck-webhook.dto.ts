import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class WebhookBuildInfo {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drivetrain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fuel_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  engine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cylinders?: number;
}

class WebhookLocation {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  longitude?: string;
}

class WebhookDealer {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;
}

class WebhookMedia {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photo_links?: string[];
}

export class MarketCheckListingWebhookDto {
  @ApiProperty({ description: 'MarketCheck listing ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Vehicle VIN' })
  @IsString()
  vin: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  heading?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  miles?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exterior_color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interior_color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dom_active?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seller_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inventory_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  carfax_1_owner?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  carfax_clean_title?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  first_seen_at_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_seen_at_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vdp_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  data_source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  in_transit?: boolean;

  @ApiPropertyOptional({ type: WebhookBuildInfo })
  @IsOptional()
  @ValidateNested()
  @Type(() => WebhookBuildInfo)
  build?: WebhookBuildInfo;

  @ApiPropertyOptional({ type: WebhookLocation })
  @IsOptional()
  @ValidateNested()
  @Type(() => WebhookLocation)
  car_location?: WebhookLocation;

  @ApiPropertyOptional({ type: WebhookDealer })
  @IsOptional()
  @ValidateNested()
  @Type(() => WebhookDealer)
  dealer?: WebhookDealer;

  @ApiPropertyOptional({ type: WebhookMedia })
  @IsOptional()
  @ValidateNested()
  @Type(() => WebhookMedia)
  media?: WebhookMedia;
}

export class MarketCheckWebhookPayloadDto {
  @ApiProperty({ description: 'Webhook event type', example: 'listing.created' })
  @IsString()
  event: string;

  @ApiPropertyOptional({ description: 'Timestamp of the event' })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Single listing data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MarketCheckListingWebhookDto)
  listing?: MarketCheckListingWebhookDto;

  @ApiPropertyOptional({ description: 'Multiple listings data', type: [MarketCheckListingWebhookDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarketCheckListingWebhookDto)
  listings?: MarketCheckListingWebhookDto[];
}
