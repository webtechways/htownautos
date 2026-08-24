import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuctionIngestGuard } from '../auction-sale-results/auction-ingest.guard';
import { ScraperWorkersService } from './scraper-workers.service';
import { PollDto } from './dto/poll.dto';

/**
 * Lo único que llaman las VM. Va en un controlador aparte del de la UI porque
 * el ClerkJwtGuard de aquél es de clase: colgarlo del mismo controlador dejaría
 * a Automa fuera aunque traiga la clave correcta (mismo motivo por el que
 * existe auction-monitor-ingest.controller.ts).
 */
@Controller('scraper')
@UseGuards(AuctionIngestGuard)
export class ScraperPollController {
  constructor(private readonly workers: ScraperWorkersService) {}

  @Post('poll')
  @HttpCode(HttpStatus.OK)
  poll(@Body() dto: PollDto, @Req() req: any) {
    const ip =
      (req.headers?.['cf-connecting-ip'] as string) ||
      (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip;
    return this.workers.poll(dto, ip);
  }
}
