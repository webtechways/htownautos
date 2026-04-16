import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBuyerAuctionBidDto {
  @ApiPropertyOptional({ description: 'Maximum bid amount in USD', example: 7500 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxBid?: number;

  @ApiPropertyOptional({ enum: ['pending', 'won', 'lost'], description: 'Bid outcome' })
  @IsOptional()
  @IsIn(['pending', 'won', 'lost'])
  status?: 'pending' | 'won' | 'lost';

  @ApiPropertyOptional({ description: 'Final amount (paid if won, final bid if lost)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  finalAmount?: number | null;

  @ApiPropertyOptional({ description: 'Optional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
