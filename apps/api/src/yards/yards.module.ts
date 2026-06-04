import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { YardsController } from './yards.controller';
import { YardsService } from './yards.service';

@Module({
  imports: [PrismaModule],
  controllers: [YardsController],
  providers: [YardsService],
  exports: [YardsService],
})
export class YardsModule {}
