import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ScraperWorkersService } from './scraper-workers.service';
import { ScraperWorkersController } from './scraper-workers.controller';
import { ScraperPollController } from './scraper-poll.controller';

// PrismaModule es obligatorio: ClerkJwtGuard inyecta PrismaService y sin él la
// API entera falla al arrancar.
@Module({
  imports: [PrismaModule],
  controllers: [ScraperWorkersController, ScraperPollController],
  providers: [ScraperWorkersService],
})
export class ScraperWorkersModule {}
