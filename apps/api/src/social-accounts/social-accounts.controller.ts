import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SocialAccountsService } from './social-accounts.service';
import {
  ConnectSocialAccountDto,
  ManualConnectSocialAccountDto,
  CreateSocialGroupDto,
  UpdateSocialGroupDto,
  SocialPlatform,
} from './dto';
import { CurrentTenant } from '@htownautos/auth';

@ApiTags('Social Accounts')
@ApiBearerAuth()
@Controller('social-accounts')
export class SocialAccountsController {
  constructor(private readonly service: SocialAccountsService) {}

  // ─── OAuth Flow ───

  @Get('oauth-url')
  @ApiOperation({ summary: 'Get OAuth authorization URL for a platform' })
  getOAuthUrl(
    @CurrentTenant() tenantId: string,
    @Query('platform') platform: SocialPlatform,
    @Query('redirectUri') redirectUri: string,
  ) {
    return { url: this.service.getOAuthUrl(platform, tenantId, redirectUri) };
  }

  @Post('connect')
  @ApiOperation({ summary: 'Exchange OAuth code and connect social account(s)' })
  @ApiResponse({ status: 200, description: 'Connected account(s)' })
  connect(
    @CurrentTenant() tenantId: string,
    @Body() dto: ConnectSocialAccountDto,
  ) {
    const redirectUri = dto.redirectUri || `${process.env.FRONTEND_URL}/dashboard/social-media/callback`;
    return this.service.exchangeOAuthCode(dto.platform, dto.code, redirectUri, tenantId);
  }

  @Post('connect/bluesky')
  @ApiOperation({ summary: 'Connect Bluesky account with app password' })
  connectBluesky(
    @CurrentTenant() tenantId: string,
    @Body() body: { identifier: string; appPassword: string },
  ) {
    return this.service.connectBluesky(tenantId, body.identifier, body.appPassword);
  }

  @Post('connect/manual')
  @ApiOperation({ summary: 'Manually connect a social account (for testing or custom integrations)' })
  manualConnect(
    @CurrentTenant() tenantId: string,
    @Body() dto: ManualConnectSocialAccountDto,
  ) {
    return this.service.manualConnect(tenantId, dto);
  }

  // ─── Account CRUD ───

  @Get()
  @ApiOperation({ summary: 'Get all connected social accounts' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a social account by ID' })
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect (delete) a social account' })
  disconnect(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.disconnect(tenantId, id);
  }

  // ─── Groups ───

  @Get('groups/all')
  @ApiOperation({ summary: 'Get all social account groups' })
  findAllGroups(@CurrentTenant() tenantId: string) {
    return this.service.findAllGroups(tenantId);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create a social account group' })
  createGroup(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateSocialGroupDto,
  ) {
    return this.service.createGroup(tenantId, dto);
  }

  @Patch('groups/:id')
  @ApiOperation({ summary: 'Update a social account group' })
  updateGroup(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSocialGroupDto,
  ) {
    return this.service.updateGroup(tenantId, id, dto);
  }

  @Delete('groups/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a social account group' })
  deleteGroup(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.deleteGroup(tenantId, id);
  }
}
