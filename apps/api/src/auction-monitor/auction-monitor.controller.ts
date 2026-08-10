import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkJwtGuard } from '@htownautos/auth';
import { AuctionMonitorService } from './auction-monitor.service';
import { UpdateMonitorConfigDto } from './dto/update-monitor-config.dto';

/**
 * Settings → Auction Monitor. Global, staff-only. Drives the headless browser
 * worker through the DB (see AuctionMonitorService).
 */
@ApiTags('Auction monitor')
@Controller('auction-monitor')
@UseGuards(ClerkJwtGuard)
@ApiBearerAuth()
export class AuctionMonitorController {
  constructor(private readonly service: AuctionMonitorService) {}

  @Get('status')
  @ApiOperation({ summary: 'Config, worker liveness, active sessions and today totals' })
  status() {
    return this.service.getStatus();
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List monitor sessions ("active" for anything not finished)' })
  sessions(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listSessions({ status, page: Number(page), limit: Number(limit) });
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'One session with its captured log tail' })
  session(@Param('id') id: string) {
    return this.service.getSession(id);
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update monitor settings (pause, lead time, filters…)' })
  updateConfig(@Body() dto: UpdateMonitorConfigDto) {
    return this.service.updateConfig(dto);
  }

  @Post('sessions/:id/stop')
  @ApiOperation({ summary: 'Ask the worker to close this page' })
  stop(@Param('id') id: string) {
    return this.service.stopSession(id);
  }

  @Post('entries/:calendarEntryId/start')
  @ApiOperation({ summary: 'Open a monitored sale page now, ignoring its schedule' })
  start(@Param('calendarEntryId') calendarEntryId: string) {
    return this.service.startEntry(calendarEntryId);
  }

  @Post('login/test')
  @ApiOperation({ summary: 'Queue an AutoBidMaster login check on the worker' })
  loginTest() {
    return this.service.requestLoginTest();
  }
}
