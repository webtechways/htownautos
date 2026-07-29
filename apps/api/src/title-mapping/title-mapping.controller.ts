import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkJwtGuard, CurrentUser } from '@htownautos/auth';
import { TitleMappingService } from './title-mapping.service';
import { AssignTitleMappingDto } from './dto/assign-title-mapping.dto';

/**
 * Staff-managed learned mapping of raw Copart `saleTitleType` codes → primary
 * title category. Assigning a code here reclassifies every lot with that code
 * across the CRM and the public portal immediately (the search/facets read the
 * mapping live).
 */
@ApiTags('Auction title mappings')
@Controller('auctions/title-mappings')
@UseGuards(ClerkJwtGuard)
@ApiBearerAuth()
export class TitleMappingController {
  constructor(private readonly service: TitleMappingService) {}

  @Get()
  @ApiOperation({ summary: 'List all learned title-code → category mappings' })
  list() {
    return this.service.list();
  }

  @Post()
  @ApiOperation({ summary: 'Assign an (unknown) title code to a category' })
  assign(
    @Body() dto: AssignTitleMappingDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.setMapping(dto.code, dto.category, userId ?? null);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a mapping (code reverts to unknown)' })
  async remove(@Param('code') code: string) {
    await this.service.removeMapping(code);
  }
}
