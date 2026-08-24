import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from '@htownautos/auth';
import { AuctionIngestGuard } from '../auction-sale-results/auction-ingest.guard';
import { ScraperWorkersService } from './scraper-workers.service';
import { PollDto } from './dto/poll.dto';

/**
 * Lo único que llaman las VM. Va en un controlador aparte del de la UI porque
 * autentica con la clave compartida y no con un JWT de Clerk.
 *
 * `@Public()` no es opcional: ClerkJwtGuard está registrado como APP_GUARD
 * global en AuthModule, así que corre en toda ruta y el @UseGuards de aquí no
 * lo desplaza. Sin el decorador, Automa recibe «No token provided» aunque
 * mande la clave correcta.
 */
@Controller('scraper')
@Public()
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
