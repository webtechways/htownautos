import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { CarfaxAnalyzerService } from './carfax-analyzer.service';
import { S3Service } from '@htownautos/common';

class UploadCarfaxDto {
  @ApiProperty({ description: 'Auction listing ID' })
  @IsString()
  @IsNotEmpty()
  auctionListingId: string;

  @ApiProperty({ description: 'S3 key of the uploaded PDF' })
  @IsString()
  @IsNotEmpty()
  s3Key: string;
}

@ApiTags('Carfax Analyzer')
@Controller('carfax-analyzer')
export class CarfaxAnalyzerController {
  constructor(
    private readonly carfaxAnalyzerService: CarfaxAnalyzerService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Register an uploaded Carfax PDF (no AI analysis yet)' })
  async upload(@Body() dto: UploadCarfaxDto) {
    const result = await this.carfaxAnalyzerService.uploadReport(
      dto.auctionListingId,
      dto.s3Key,
    );
    return { data: result };
  }

  @Post(':reportId/analyze')
  @ApiOperation({ summary: 'Run AI analysis on an existing Carfax report' })
  @ApiParam({ name: 'reportId', description: 'Carfax report ID' })
  async analyze(@Param('reportId') reportId: string) {
    const result = await this.carfaxAnalyzerService.analyzeReport(reportId);
    return { data: result };
  }

  @Get('download')
  @ApiOperation({ summary: 'Get a signed download URL for a Carfax PDF' })
  @ApiQuery({ name: 'key', required: true, description: 'S3 key of the PDF' })
  @ApiQuery({ name: 'expiresIn', required: false, description: 'URL expiration in seconds' })
  async getDownloadUrl(
    @Query('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const ttl = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const url = await this.s3Service.getSignedUrl(key, ttl);
    return { url };
  }

  @Post('batch-check')
  @ApiOperation({ summary: 'Batch check which auction listing IDs have Carfax reports' })
  async batchCheck(@Body() body: { ids: string[] }) {
    const idsWithReports = await this.carfaxAnalyzerService.batchCheckHasReports(body.ids || []);
    return { data: idsWithReports };
  }

  @Get(':auctionListingId')
  @ApiOperation({ summary: 'Get existing Carfax reports for an auction listing' })
  @ApiParam({ name: 'auctionListingId', description: 'Auction listing ID' })
  async getReports(@Param('auctionListingId') auctionListingId: string) {
    const reports = await this.carfaxAnalyzerService.getReports(auctionListingId);
    return { data: reports };
  }
}
