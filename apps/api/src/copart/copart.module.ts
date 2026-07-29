import { Module } from '@nestjs/common';
import { CopartController } from './copart.controller';
import { CopartService } from './copart.service';
import { PrismaService } from '@htownautos/prisma';
import { TitleMappingModule } from '../title-mapping/title-mapping.module';

@Module({
  imports: [TitleMappingModule],
  controllers: [CopartController],
  providers: [CopartService, PrismaService],
  exports: [CopartService],
})
export class CopartModule {}
