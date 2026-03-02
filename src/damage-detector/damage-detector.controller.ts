import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { DamageDetectorService } from './damage-detector.service';

class AnalyzeDamagesDto {
  @ApiProperty({ description: 'Auction listing ID' })
  @IsString()
  @IsNotEmpty()
  auctionListingId: string;

  @ApiProperty({ description: 'Array of image URLs to analyze', type: [String] })
  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];
}

@ApiTags('Damage Detector')
@Controller('damage-detector')
export class DamageDetectorController {
  constructor(private readonly damageDetectorService: DamageDetectorService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze vehicle images for damage using AI' })
  async analyze(@Body() dto: AnalyzeDamagesDto) {
    const result = await this.damageDetectorService.analyzeImages(
      dto.auctionListingId,
      dto.imageUrls,
    );
    return { data: result };
  }

  @Get(':auctionListingId')
  @ApiOperation({ summary: 'Get existing damage analyses for an auction listing' })
  @ApiParam({ name: 'auctionListingId', description: 'Auction listing ID' })
  async getAnalyses(@Param('auctionListingId') auctionListingId: string) {
    const analyses = await this.damageDetectorService.getAnalyses(auctionListingId);
    return { data: analyses };
  }
}
