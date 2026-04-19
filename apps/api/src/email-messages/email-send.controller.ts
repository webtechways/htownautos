import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmailMessagesService } from './email-messages.service';
import type { AuthenticatedUser } from '@htownautos/auth';
import { CurrentTenant, CurrentUser } from '@htownautos/auth';

// SES raw message hard limit is 10MB. Base64 inflates ~33%, so cap input at ~7MB total.
const MAX_ATTACHMENT_BYTES = 7 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 7 * 1024 * 1024;

class AttachmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @IsString()
  @MaxLength(255)
  contentType: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_ATTACHMENT_BYTES)
  size?: number;
}

class SendEmailToBuyerBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(998) // RFC 5322 line length cap for Subject
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1_000_000) // ~1MB of HTML
  bodyHtml: string;

  @IsOptional()
  @IsString()
  @MaxLength(1_000_000)
  bodyText?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

@ApiTags('Email Sending')
@ApiBearerAuth()
@Controller('email')
export class EmailSendController {
  constructor(private readonly emailMessagesService: EmailMessagesService) {}

  private getTenantUserId(user: AuthenticatedUser, tenantId: string): string {
    const tenantUser = user.tenants?.find(
      (t) => t.tenantId === tenantId || t.tenant?.id === tenantId,
    );
    if (!tenantUser) {
      throw new BadRequestException('User is not a member of this tenant');
    }
    return tenantUser.id;
  }

  @Post('send-to-buyer/:buyerId')
  @ApiOperation({
    summary: 'Send an email to a buyer',
    description: 'Sends an outbound email via AWS SES, records it, and emits a realtime event',
  })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiResponse({ status: 201, description: 'Email sent and recorded' })
  @ApiResponse({ status: 400, description: 'Invalid input or SES failure' })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  sendToBuyer(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() body: SendEmailToBuyerBodyDto,
  ) {
    const tenantUserId = this.getTenantUserId(user, tenantId);

    // Enforce aggregate attachment size to protect SES's 10MB raw-message limit.
    if (body.attachments?.length) {
      const totalBytes = body.attachments.reduce(
        (sum, a) => sum + (a.size ?? this.estimateBase64Bytes(a.content)),
        0,
      );
      if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
        throw new BadRequestException(
          `Attachments exceed the ${Math.round(MAX_TOTAL_ATTACHMENT_BYTES / 1024 / 1024)}MB limit`,
        );
      }
    }

    return this.emailMessagesService.sendToBuyer(tenantId, tenantUserId, buyerId, body);
  }

  private estimateBase64Bytes(content: string): number {
    const i = content.indexOf('base64,');
    const b64 = i >= 0 ? content.slice(i + 'base64,'.length) : content;
    // base64 -> bytes: roughly length * 3/4
    return Math.floor((b64.length * 3) / 4);
  }
}
