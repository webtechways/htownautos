import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { MaxBidService } from './max-bid.service';

class MarketPriceDataDto {
  @ApiProperty() marketcheckPrice: number | null;
  @ApiProperty() msrp: number | null;
}

class CompsDataDto {
  @ApiProperty() listings: any[];
  @ApiProperty() numFound: number;
}

class CalculateMaxBidDto {
  @ApiProperty({ description: 'Auction listing ID' })
  @IsString()
  @IsNotEmpty()
  auctionListingId: string;

  @ApiProperty({ description: 'Market price data from MarketCheck' })
  @IsObject()
  marketPriceData: MarketPriceDataDto;

  @ApiProperty({ description: 'Comparable vehicles data from MarketCheck' })
  @IsObject()
  compsData: CompsDataDto;
}

@ApiTags('Max Bid Recommendation')
@Controller('max-bid')
export class MaxBidController {
  constructor(private readonly maxBidService: MaxBidService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate max bid recommendation using AI' })
  async calculate(@Body() dto: CalculateMaxBidDto) {
    const result = await this.maxBidService.calculateMaxBid(
      dto.auctionListingId,
      dto.marketPriceData,
      dto.compsData,
    );
    return { data: result };
  }

  @Get(':auctionListingId')
  @ApiOperation({
    summary: 'Get existing max bid recommendations for an auction listing',
  })
  @ApiParam({ name: 'auctionListingId', description: 'Auction listing ID' })
  async getRecommendations(
    @Param('auctionListingId') auctionListingId: string,
  ) {
    const recommendations =
      await this.maxBidService.getRecommendations(auctionListingId);
    return { data: recommendations };
  }
}
