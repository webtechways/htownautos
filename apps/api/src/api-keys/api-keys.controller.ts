import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ADMIN_ROLES,
  CurrentTenant,
  CurrentUser,
  RequireRoles,
  RolesGuard,
} from '@htownautos/auth';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';

@ApiTags('API Keys')
@ApiBearerAuth()
@Controller('api-keys')
@UseGuards(RolesGuard)
@RequireRoles(...ADMIN_ROLES)
export class ApiKeysController {
  constructor(private readonly service: ApiKeysService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'List available scope resources + actions' })
  catalog() {
    return this.service.catalog();
  }

  @Get()
  @ApiOperation({ summary: 'List API keys for the current tenant' })
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new API key (plaintext token is returned once)' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.service.create(tenantId, user?.id ?? null, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an API key (name / scopes / expiration)' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApiKeyDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke an API key without deleting the audit row' })
  revoke(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.revoke(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hard-delete an API key' })
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(tenantId, id);
  }
}
