import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { PartsPricingService } from './parts-pricing.service';

class AnalyzePartsDto {
  @ApiProperty({ description: 'Auction listing ID' })
  @IsString()
  @IsNotEmpty()
  auctionListingId: string;
}

@ApiTags('Parts Pricing')
@Controller('parts-pricing')
export class PartsPricingController {
  constructor(private readonly partsPricingService: PartsPricingService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Get market prices for vehicle parts using AI' })
  async analyze(@Body() dto: AnalyzePartsDto) {
    const result = await this.partsPricingService.analyzeParts(dto.auctionListingId);
    return { data: result };
  }

  @Get(':auctionListingId')
  @ApiOperation({ summary: 'Get existing parts pricing for an auction listing' })
  @ApiParam({ name: 'auctionListingId', description: 'Auction listing ID' })
  async getParts(@Param('auctionListingId') auctionListingId: string) {
    const parts = await this.partsPricingService.getParts(auctionListingId);
    return { data: parts };
  }
}
