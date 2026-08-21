import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkJwtGuard } from '@htownautos/auth';
import { ScraperAgentsService } from './scraper-agents.service';
import {
  CreateScraperAgentDto,
  GenerateScraperAgentsDto,
  UpdateScraperAgentDto,
} from './dto/scraper-agent.dto';
import { BulkActiveDto, BulkDeleteDto, ReassignEntryDto } from './dto/bulk.dto';

/** Auction Data → Scraper Agents. Global, solo staff. */
@ApiTags('Scraper agents')
@Controller('scraper-agents')
@UseGuards(ClerkJwtGuard)
@ApiBearerAuth()
export class ScraperAgentsController {
  constructor(private readonly service: ScraperAgentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar agentes (filtro por portal y búsqueda)' })
  list(
    @Query('auction') auction?: string,
    @Query('country') country?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.list({ auction, country, search, page: Number(page), limit: Number(limit) });
  }

  @Post()
  @ApiOperation({ summary: 'Crear un agente (genera contraseña si no se envía)' })
  create(@Body() dto: CreateScraperAgentDto) {
    return this.service.create(dto);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Alta masiva con nombre y contraseña; el email se pone después' })
  generate(@Body() dto: GenerateScraperAgentsDto) {
    return this.service.generate(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un agente' })
  update(@Param('id') id: string, @Body() dto: UpdateScraperAgentDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/regenerate-password')
  @ApiOperation({ summary: 'Nueva contraseña para un agente' })
  regenerate(@Param('id') id: string) {
    return this.service.regeneratePassword(id);
  }

  @Get(':id/entries')
  @ApiOperation({ summary: 'Subastas futuras asignadas a este agente' })
  entries(@Param('id') id: string) {
    return this.service.assignedEntries(id);
  }

  @Patch('bulk/active')
  @ApiOperation({ summary: 'Activar o desactivar varios agentes' })
  bulkActive(@Body() dto: BulkActiveDto) {
    return this.service.bulkSetActive(dto.ids, dto.active);
  }

  @Post('bulk/delete')
  @ApiOperation({
    summary: 'Eliminar varios agentes traspasando sus subastas',
    description:
      'strategy: transfer (a toAgentId) · random (reparte entre los activos) · ' +
      'release (las suelta para el job de mañana). Solo antes de las 8:00 de Houston.',
  })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.service.bulkRemove(dto.ids, dto.strategy, dto.toAgentId);
  }

  @Post('entries/:entryId/reassign')
  @ApiOperation({ summary: 'Mover una subasta a otro agente (antes de las 8:00)' })
  reassignEntry(@Param('entryId') entryId: string, @Body() dto: ReassignEntryDto) {
    return this.service.reassignEntry(entryId, dto.toAgentId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un agente traspasando sus subastas' })
  remove(
    @Param('id') id: string,
    @Query('strategy') strategy?: 'transfer' | 'random' | 'release',
    @Query('toAgentId') toAgentId?: string,
  ) {
    return this.service.remove(id, strategy ?? 'random', toAgentId);
  }
}
