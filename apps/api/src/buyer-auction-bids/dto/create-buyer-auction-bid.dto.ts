import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BidItemDto {
  @ApiProperty({ description: 'Auction lot number', example: '12345678' })
  @IsString()
  lotNumber!: string;

  @ApiProperty({ description: 'Maximum bid amount in USD', example: 7500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxBid!: number;

  @ApiPropertyOptional({ description: 'Optional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateBuyerAuctionBidsDto {
  @ApiProperty({ type: [BidItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BidItemDto)
  items!: BidItemDto[];
}
