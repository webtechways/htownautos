import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClerkJwtGuard, CurrentTenant, CurrentUser } from '@htownautos/auth';
import { Public } from '@htownautos/auth';
import { InspectionShareLinksService } from './inspection-share-links.service';
import { CreateShareLinkDto } from './dto/create-share-link.dto';

@ApiTags('Inspection Share Links')
@Controller()
export class InspectionShareLinksController {
  constructor(private readonly service: InspectionShareLinksService) {}

  // ─── admin (authenticated) ─────────────────────────────────────────

  @Post('vehicle-inspections/:id/share-links')
  @UseGuards(ClerkJwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a public read-only share link for an inspection' })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateShareLinkDto,
  ) {
    return this.service.create(id, tenantId, userId, dto);
  }

  @Get('vehicle-inspections/:id/share-links')
  @UseGuards(ClerkJwtGuard)
  @ApiOperation({ summary: 'List share links for an inspection' })
  @ApiParam({ name: 'id', description: 'Inspection UUID' })
  list(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.listForInspection(id, tenantId);
  }

  @Delete('vehicle-inspections/share-links/:linkId')
  @UseGuards(ClerkJwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a share link (sets revoked=true; row stays)' })
  @ApiParam({ name: 'linkId', description: 'Share link UUID' })
  revoke(
    @CurrentTenant() tenantId: string,
    @Param('linkId', ParseUUIDPipe) linkId: string,
  ) {
    return this.service.revoke(linkId, tenantId);
  }

  // ─── public (no auth) ──────────────────────────────────────────────

  @Get('public/inspections/shared')
  @Public()
  @ApiOperation({
    summary:
      'Public read-only inspection view, resolved by share token + VIN',
  })
  @ApiQuery({ name: 'vin', required: true })
  @ApiQuery({ name: 'token', required: true })
  resolvePublic(
    @Query('vin') vin: string,
    @Query('token') token: string,
  ) {
    return this.service.resolvePublic(token, vin);
  }
}
