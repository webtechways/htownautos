import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ShortUrlService {
  private readonly baseUrl: string;

  constructor(private readonly prisma: PrismaService) {
    this.baseUrl =
      process.env.SHORT_URL_BASE || 'https://link.htownautos.com';
  }

  async create(
    originalUrl: string,
    tenantId: string,
    createdBy?: string,
    expiresAt?: Date,
  ): Promise<{ shortUrl: string; code: string }> {
    const code = this.generateCode();

    await this.prisma.shortUrl.create({
      data: { code, originalUrl, tenantId, createdBy, expiresAt },
    });

    return {
      code,
      shortUrl: `${this.baseUrl}/${code}`,
    };
  }

  async resolve(code: string): Promise<string> {
    const record = await this.prisma.shortUrl.findUnique({ where: { code } });

    if (!record) {
      throw new NotFoundException('Link not found');
    }

    if (record.expiresAt && record.expiresAt < new Date()) {
      throw new NotFoundException('Link has expired');
    }

    // Increment clicks in background — don't block redirect
    this.prisma.shortUrl
      .update({ where: { code }, data: { clicks: { increment: 1 } } })
      .catch(() => {});

    return record.originalUrl;
  }

  private generateCode(): string {
    return randomBytes(4).toString('base64url'); // 6 chars, URL-safe
  }
}
