import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClerkJwtGuard } from '@htownautos/auth';
import { ScraperWorkersService } from './scraper-workers.service';
import { UpdateScraperWorkerDto } from './dto/scraper-worker.dto';

/** Auction Data → Scraper Workers. */
@Controller('scraper-workers')
@UseGuards(ClerkJwtGuard)
export class ScraperWorkersController {
  constructor(private readonly workers: ScraperWorkersService) {}

  @Get()
  list() {
    return this.workers.list();
  }

  @Get(':id/entries')
  entries(@Param('id') id: string) {
    return this.workers.entries(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScraperWorkerDto) {
    return this.workers.update(id, dto);
  }

  /** Suelta el día de una VM sin borrarla — para rehacer el reparto a mano. */
  @Post(':id/release')
  release(@Param('id') id: string) {
    return this.workers.release(id).then((released) => ({ released }));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workers.remove(id);
  }
}
