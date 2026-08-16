import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkJwtGuard } from '@htownautos/auth';
import { AgentAssignmentService } from '@htownautos/common';
import { AuctionCalendarService } from './auction-calendar.service';
import { UpdateCalendarConfigDto } from './dto/update-calendar-config.dto';

/**
 * AutoBidMaster auction calendar (Settings → Auction Calendar). Global, staff-only.
 */
@ApiTags('Auction calendar')
@Controller('auction-calendar')
@UseGuards(ClerkJwtGuard)
@ApiBearerAuth()
export class AuctionCalendarController {
  constructor(
    private readonly service: AuctionCalendarService,
    private readonly assignment: AgentAssignmentService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Counts per status + refresh config' })
  status() {
    return this.service.getStatus();
  }

  @Get()
  @ApiOperation({ summary: 'List calendar entries (with pre-built links)' })
  list(
    @Query('status') status?: string,
    @Query('group') group?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.list({ status, group, page: Number(page), limit: Number(limit) });
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update refresh cadence' })
  updateConfig(@Body() dto: UpdateCalendarConfigDto) {
    return this.service.updateConfig(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Fetch the calendar from AutoBidMaster now' })
  refresh() {
    return this.service.fetchAndStore();
  }

  @Post('assign-agents')
  @ApiOperation({
    summary: 'Repartir ahora las subastas sin agente entre los agentes activos',
    description:
      'Lo mismo que hace el job diario de las 6:00 (hora de Houston). Es idempotente: ' +
      'solo toca las entradas futuras que aún no tienen agente.',
  })
  assignAgents() {
    return this.assignment.assignPending();
  }

  @Patch(':id/monitor')
  @ApiOperation({ summary: 'Toggle the monitor flag on a calendar entry' })
  setMonitor(@Param('id') id: string, @Body() body: { monitor: boolean }) {
    return this.service.setMonitor(id, !!body.monitor);
  }
}
