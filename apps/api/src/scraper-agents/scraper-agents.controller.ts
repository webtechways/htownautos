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
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.list({ auction, search, page: Number(page), limit: Number(limit) });
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

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un agente' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
