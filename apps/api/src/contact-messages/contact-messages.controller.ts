import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentTenant } from '@htownautos/auth';
import { ContactMessagesService } from './contact-messages.service';
import { ListContactMessagesDto } from './dto/list-contact-messages.dto';

/**
 * Staff endpoint to view and manage contact messages submitted via the public
 * contact form. Global guards (ApiKey→Clerk→Tenant) apply — no @UseGuards here.
 */
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  /**
   * GET /contact-messages?page=&limit=&status=
   * Paginated list of contact messages for the current tenant.
   */
  @Get()
  list(
    @CurrentTenant() tenantId: string,
    @Query() query: ListContactMessagesDto,
  ) {
    return this.contactMessagesService.list(tenantId, query);
  }

  /**
   * PATCH /contact-messages/:id/read
   * Sets a contact message status to READ.
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markRead(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contactMessagesService.markRead(id, tenantId);
  }
}
