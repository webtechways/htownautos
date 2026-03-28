import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@htownautos/auth';
import { UploadSessionService } from './upload-session.service';
import { PresignMediaDto } from '@htownautos/media';
import { ConfirmMediaDto } from '@htownautos/media';

@ApiTags('Upload Sessions (Public)')
@Controller('upload-sessions/public')
@Public()
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class UploadSessionPublicController {
  constructor(private readonly uploadSessionService: UploadSessionService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Validate token and get session info (public)' })
  async getSessionInfo(@Param('token') token: string) {
    return this.uploadSessionService.getPublicInfo(token);
  }

  @Post(':token/presign')
  @ApiOperation({ summary: 'Presign an upload using session context (public)' })
  async presign(
    @Param('token') token: string,
    @Body() dto: PresignMediaDto,
  ) {
    return this.uploadSessionService.presign(token, dto);
  }

  @Post(':token/confirm')
  @ApiOperation({ summary: 'Confirm an upload using session context (public)' })
  async confirm(
    @Param('token') token: string,
    @Body() dto: ConfirmMediaDto,
  ) {
    return this.uploadSessionService.confirm(token, dto);
  }
}
