import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { ListContactMessagesDto } from './dto/list-contact-messages.dto';

@Injectable()
export class ContactMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: ListContactMessagesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async markRead(id: string, tenantId: string) {
    const existing = await this.prisma.contactMessage.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`ContactMessage ${id} not found`);
    }

    return this.prisma.contactMessage.update({
      where: { id },
      data: { status: 'READ' },
    });
  }
}
