import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { RebuildController } from './rebuild.controller';
import { RebuildService } from './rebuild.service';

@Module({
  imports: [PrismaModule],
  controllers: [RebuildController],
  providers: [RebuildService],
})
export class RebuildModule {}
