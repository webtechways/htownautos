import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClerkJwtGuard, CurrentTenant, CurrentUser } from '@htownautos/auth';
import { VehicleInspectionsService } from './vehicle-inspections.service';
import { CreateVehicleInspectionDto } from './dto/create-vehicle-inspection.dto';
import { UpdateVehicleInspectionDto } from './dto/update-vehicle-inspection.dto';
import { ListVehicleInspectionsDto } from './dto/list-vehicle-inspections.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';

@ApiTags('Vehicle Inspections')
@Controller('vehicle-inspections')
@UseGuards(ClerkJwtGuard)
export class VehicleInspectionsController {
  constructor(private readonly service: VehicleInspectionsService) {}

  // ─── inspections ──────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List vehicle inspections (paginated)' })
  @ApiResponse({ status: HttpStatus.OK })
  list(
    @CurrentTenant() tenantId: string,
    @Query() query: ListVehicleInspectionsDto,
  ) {
    return this.service.list(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single inspection (with checklist + media)' })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  get(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.get(id, tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an inspection' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateVehicleInspectionDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inspection (status, rating, notes…)' })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleInspectionDto,
  ) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Delete an inspection (cascades the checklist + all inspection media — carfax records are NOT touched).',
  })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(id, tenantId);
  }

  // ─── checklist items ──────────────────────────────────────────────

  @Post(':id/checklist')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a checklist item to an inspection' })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  addChecklistItem(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateChecklistItemDto,
  ) {
    return this.service.addChecklistItem(id, tenantId, dto);
  }

  @Patch(':id/checklist/:itemId')
  @ApiOperation({
    summary: 'Update a checklist item (quality 1=red 2=yellow 3=green, notes, transcription…)',
  })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  @ApiParam({ name: 'itemId', description: 'Checklist item UUID' })
  updateChecklistItem(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.service.updateChecklistItem(itemId, id, tenantId, dto);
  }

  @Delete(':id/checklist/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a checklist item (cascades its media)' })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  @ApiParam({ name: 'itemId', description: 'Checklist item UUID' })
  removeChecklistItem(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.service.removeChecklistItem(itemId, id, tenantId);
  }
}
