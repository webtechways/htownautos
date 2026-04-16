import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { validateScopes, API_SCOPE_RESOURCES, API_SCOPE_ACTIONS } from '@htownautos/auth';
import * as crypto from 'crypto';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';

const KEY_PREFIX = 'hta_';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Static scope catalog exposed to the UI so it can render the permission picker. */
  catalog() {
    return {
      resources: API_SCOPE_RESOURCES,
      actions: API_SCOPE_ACTIONS,
    };
  }

  async list(tenantId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: [{ revokedAt: 'asc' }, { createdAt: 'desc' }],
    });
    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      description: k.description,
      prefix: k.prefix,
      scopes: k.scopes,
      createdById: k.createdById,
      lastUsedAt: k.lastUsedAt,
      lastUsedIp: k.lastUsedIp,
      expiresAt: k.expiresAt,
      revokedAt: k.revokedAt,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
      isActive: !k.revokedAt && (!k.expiresAt || k.expiresAt > new Date()),
    }));
  }

  async findOne(tenantId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!key) throw new NotFoundException('API key not found');
    return key;
  }

  /**
   * Creates a new API key. Returns the **plaintext token ONCE** — it is not
   * stored and cannot be retrieved again.
   */
  async create(tenantId: string, userId: string | null, dto: CreateApiKeyDto) {
    const { valid, invalid } = validateScopes(dto.scopes);
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid scopes: ${invalid.join(', ')}`);
    }
    if (valid.length === 0) {
      throw new BadRequestException('At least one scope is required');
    }

    const env = process.env.NODE_ENV === 'production' ? 'live' : 'test';
    // hta_<env>_<40-char-hex>
    const secret = crypto.randomBytes(20).toString('hex');
    const token = `${KEY_PREFIX}${env}_${secret}`;
    const prefix = token.slice(0, 12); // "hta_live_abc" — shown to the user
    const hashedKey = crypto.createHash('sha256').update(token).digest('hex');

    const created = await this.prisma.apiKey.create({
      data: {
        tenantId,
        createdById: userId,
        name: dto.name,
        description: dto.description,
        prefix,
        hashedKey,
        scopes: valid,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    this.logger.log(`API key created: ${prefix}… tenant=${tenantId} scopes=${valid.join(',')}`);

    return {
      id: created.id,
      name: created.name,
      prefix: created.prefix,
      scopes: created.scopes,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
      // Plaintext, shown ONCE.
      token,
    };
  }

  async update(tenantId: string, id: string, dto: UpdateApiKeyDto) {
    await this.findOne(tenantId, id);

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.scopes !== undefined) {
      const { valid, invalid } = validateScopes(dto.scopes);
      if (invalid.length > 0) {
        throw new BadRequestException(`Invalid scopes: ${invalid.join(', ')}`);
      }
      data.scopes = valid;
    }
    if (dto.expiresAt !== undefined) {
      data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    return this.prisma.apiKey.update({ where: { id }, data });
  }

  async revoke(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.apiKey.delete({ where: { id } });
    return { message: 'API key deleted' };
  }
}
