import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ScraperAgentsService } from './scraper-agents.service';
import { ScraperAgentsController } from './scraper-agents.controller';

// PrismaModule es obligatorio: ClerkJwtGuard inyecta PrismaService y sin él la
// API entera falla al arrancar.
@Module({
  imports: [PrismaModule],
  controllers: [ScraperAgentsController],
  providers: [ScraperAgentsService],
})
export class ScraperAgentsModule {}
