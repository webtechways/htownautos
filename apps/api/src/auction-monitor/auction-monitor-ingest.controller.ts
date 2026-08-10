import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '@htownautos/auth';
import { AuctionIngestGuard } from '../auction-sale-results/auction-ingest.guard';
import { AuctionMonitorService } from './auction-monitor.service';
import { UploadScreenshotDto } from './dto/upload-screenshot.dto';

/**
 * Worker-facing side of the monitor. Separate controller because the browser
 * container authenticates with the shared ingest secret, not a Clerk JWT (a
 * class-level ClerkJwtGuard would still run if this lived on the main one).
 */
@ApiTags('Auction monitor')
@ApiSecurity('x-api-key')
@Controller('auction-monitor')
@Public()
@UseGuards(AuctionIngestGuard)
export class AuctionMonitorIngestController {
  constructor(private readonly service: AuctionMonitorService) {}

  @Post('screenshot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Store a page capture pushed by the monitor worker',
    description:
      'The worker has no S3 credentials; it posts base64 JPEG here and the API ' +
      'uploads it and links it to the login check or the session.',
  })
  upload(@Body() dto: UploadScreenshotDto) {
    return this.service.storeScreenshot(dto);
  }
}
