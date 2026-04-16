import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import {
  ManualConnectSocialAccountDto,
  CreateSocialGroupDto,
  UpdateSocialGroupDto,
  SocialPlatform,
} from './dto';

@Injectable()
export class SocialAccountsService {
  private readonly logger = new Logger(SocialAccountsService.name);

  constructor(private prisma: PrismaService) {}

  // ─── OAuth URL generation ───

  getOAuthUrl(platform: SocialPlatform, tenantId: string, redirectUri: string): string {
    const state = Buffer.from(JSON.stringify({ tenantId, platform })).toString('base64url');

    switch (platform) {
      case SocialPlatform.FACEBOOK:
      case SocialPlatform.INSTAGRAM:
        // Instagram uses Facebook's OAuth — permissions differ
        const fbScopes = platform === SocialPlatform.INSTAGRAM
          ? 'instagram_basic,instagram_content_publish,instagram_manage_messages,pages_show_list,pages_read_engagement'
          : 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_messaging,pages_manage_metadata,public_profile';
        return `https://www.facebook.com/v21.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${fbScopes}&state=${state}&response_type=code`;

      case SocialPlatform.TIKTOK:
        return `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=user.info.basic,video.upload,video.publish,video.list&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

      case SocialPlatform.YOUTUBE:
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload&response_type=code&access_type=offline&prompt=consent&state=${state}`;

      case SocialPlatform.LINKEDIN:
        return `https://www.linkedin.com/oauth/v2/authorization?client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid profile w_member_social r_organization_social w_organization_social rw_organization_admin&response_type=code&state=${state}`;

      case SocialPlatform.PINTEREST:
        return `https://www.pinterest.com/oauth/?client_id=${process.env.PINTEREST_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=boards:read,pins:read,pins:write&response_type=code&state=${state}`;

      case SocialPlatform.GBP:
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/business.manage&response_type=code&access_type=offline&prompt=consent&state=${state}`;

      case SocialPlatform.THREADS:
        return `https://threads.net/oauth/authorize?client_id=${process.env.THREADS_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=threads_basic,threads_content_publish,threads_manage_replies,threads_read_replies&response_type=code&state=${state}`;

      case SocialPlatform.BLUESKY:
        // Bluesky uses AT Protocol — no OAuth, uses app password
        throw new BadRequestException('Bluesky uses app password authentication, not OAuth');

      default:
        throw new BadRequestException(`OAuth not supported for platform: ${platform}`);
    }
  }

  // ─── OAuth token exchange ───

  async exchangeOAuthCode(
    platform: SocialPlatform,
    code: string,
    redirectUri: string,
    tenantId: string,
  ) {
    this.logger.log(`→ OAuth exchange: ${platform}`);

    switch (platform) {
      case SocialPlatform.FACEBOOK:
      case SocialPlatform.INSTAGRAM:
        return this.exchangeFacebookCode(platform, code, redirectUri, tenantId);

      case SocialPlatform.TIKTOK:
        return this.exchangeTikTokCode(code, redirectUri, tenantId);

      case SocialPlatform.YOUTUBE:
      case SocialPlatform.GBP:
        return this.exchangeGoogleCode(platform, code, redirectUri, tenantId);

      case SocialPlatform.LINKEDIN:
        return this.exchangeLinkedInCode(code, redirectUri, tenantId);

      case SocialPlatform.PINTEREST:
        return this.exchangePinterestCode(code, redirectUri, tenantId);

      case SocialPlatform.THREADS:
        return this.exchangeThreadsCode(code, redirectUri, tenantId);

      default:
        throw new BadRequestException(`OAuth exchange not implemented for: ${platform}`);
    }
  }

  private async exchangeFacebookCode(platform: SocialPlatform, code: string, redirectUri: string, tenantId: string) {
    // Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new BadRequestException(tokenData.error.message);

    // Exchange short-lived for long-lived token
    const longRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`,
    );
    const longData = await longRes.json();
    const longLivedToken = longData.access_token || tokenData.access_token;

    if (platform === SocialPlatform.INSTAGRAM) {
      // Get Instagram accounts linked to Facebook pages
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account{id,name,username,profile_picture_url}&access_token=${longLivedToken}`,
      );
      const pagesData = await pagesRes.json();
      const accounts: any[] = [];

      for (const page of pagesData.data || []) {
        const ig = page.instagram_business_account;
        if (!ig) continue;
        const account = await this.upsertAccount(tenantId, {
          platform: SocialPlatform.INSTAGRAM,
          platformAccountId: ig.id,
          name: ig.name || ig.username,
          username: ig.username,
          avatarUrl: ig.profile_picture_url,
          accessToken: longLivedToken,
          pageId: page.id,
          scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_messages'],
        });
        accounts.push(account);
      }
      return accounts;
    }

    // Facebook Pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,picture{url},access_token&access_token=${longLivedToken}`,
    );
    const pagesData = await pagesRes.json();
    const accounts: any[] = [];

    for (const page of pagesData.data || []) {
      const account = await this.upsertAccount(tenantId, {
        platform: SocialPlatform.FACEBOOK,
        platformAccountId: page.id,
        name: page.name,
        avatarUrl: page.picture?.data?.url,
        accessToken: page.access_token, // page-level token (long-lived)
        pageId: page.id,
        scopes: ['pages_show_list', 'pages_manage_posts', 'pages_messaging'],
      });
      accounts.push(account);
    }
    return accounts;
  }

  private async exchangeTikTokCode(code: string, redirectUri: string, tenantId: string) {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json();
    if (data.error) throw new BadRequestException(data.error_description || data.error);

    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,username',
      { headers: { Authorization: `Bearer ${data.access_token}` } },
    );
    const userData = await userRes.json();
    const user = userData.data?.user;

    return [await this.upsertAccount(tenantId, {
      platform: SocialPlatform.TIKTOK,
      platformAccountId: data.open_id,
      name: user?.display_name || 'TikTok Account',
      username: user?.username,
      avatarUrl: user?.avatar_url,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: data.scope?.split(',') || [],
    })];
  }

  private async exchangeGoogleCode(platform: SocialPlatform, code: string, redirectUri: string, tenantId: string) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json();
    if (data.error) throw new BadRequestException(data.error_description || data.error);

    if (platform === SocialPlatform.YOUTUBE) {
      const chRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        { headers: { Authorization: `Bearer ${data.access_token}` } },
      );
      const chData = await chRes.json();
      const channel = chData.items?.[0];
      return [await this.upsertAccount(tenantId, {
        platform: SocialPlatform.YOUTUBE,
        platformAccountId: channel?.id || 'unknown',
        name: channel?.snippet?.title || 'YouTube Channel',
        avatarUrl: channel?.snippet?.thumbnails?.default?.url,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
        scopes: ['youtube.readonly', 'youtube.upload'],
      })];
    }

    // GBP
    const locRes = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${data.access_token}` } },
    );
    const locData = await locRes.json();
    const accounts: any[] = [];
    for (const acc of locData.accounts || []) {
      accounts.push(await this.upsertAccount(tenantId, {
        platform: SocialPlatform.GBP,
        platformAccountId: acc.name,
        name: acc.accountName || 'Google Business Profile',
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
        scopes: ['business.manage'],
      }));
    }
    return accounts.length > 0 ? accounts : [await this.upsertAccount(tenantId, {
      platform: SocialPlatform.GBP,
      platformAccountId: 'gbp-' + tenantId.slice(0, 8),
      name: 'Google Business Profile',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: ['business.manage'],
    })];
  }

  private async exchangeLinkedInCode(code: string, redirectUri: string, tenantId: string) {
    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json();
    if (data.error) throw new BadRequestException(data.error_description || data.error);

    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const profile = await profileRes.json();

    return [await this.upsertAccount(tenantId, {
      platform: SocialPlatform.LINKEDIN,
      platformAccountId: profile.sub,
      name: profile.name || 'LinkedIn Profile',
      avatarUrl: profile.picture,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: ['w_member_social', 'r_organization_social'],
    })];
  }

  private async exchangePinterestCode(code: string, redirectUri: string, tenantId: string) {
    const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json();
    if (data.error) throw new BadRequestException(data.error_description || data.error);

    const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const user = await userRes.json();

    return [await this.upsertAccount(tenantId, {
      platform: SocialPlatform.PINTEREST,
      platformAccountId: user.username || 'unknown',
      name: user.business_name || user.username || 'Pinterest Account',
      username: user.username,
      avatarUrl: user.profile_image,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: ['boards:read', 'pins:read', 'pins:write'],
    })];
  }

  private async exchangeThreadsCode(code: string, redirectUri: string, tenantId: string) {
    // Threads short-lived token
    const res = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.THREADS_APP_ID!,
        client_secret: process.env.THREADS_APP_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json();
    if (data.error) throw new BadRequestException(data.error?.message || 'Threads OAuth failed');

    // Exchange for long-lived token
    const longRes = await fetch(
      `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${process.env.THREADS_APP_SECRET}&access_token=${data.access_token}`,
    );
    const longData = await longRes.json();
    const token = longData.access_token || data.access_token;

    const profileRes = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${token}`,
    );
    const profile = await profileRes.json();

    return [await this.upsertAccount(tenantId, {
      platform: SocialPlatform.THREADS,
      platformAccountId: profile.id || data.user_id,
      name: profile.name || profile.username || 'Threads Account',
      username: profile.username,
      avatarUrl: profile.threads_profile_picture_url,
      accessToken: token,
      tokenExpiresAt: longData.expires_in ? new Date(Date.now() + longData.expires_in * 1000) : undefined,
      scopes: ['threads_basic', 'threads_content_publish'],
    })];
  }

  // ─── Bluesky (app password auth) ───

  async connectBluesky(tenantId: string, identifier: string, appPassword: string) {
    const res = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: appPassword }),
    });
    const data = await res.json();
    if (data.error) throw new BadRequestException(data.message || 'Bluesky authentication failed');

    return [await this.upsertAccount(tenantId, {
      platform: SocialPlatform.BLUESKY,
      platformAccountId: data.did,
      name: data.handle,
      username: data.handle,
      avatarUrl: data.didDoc?.service?.[0]?.serviceEndpoint ? undefined : undefined,
      accessToken: data.accessJwt,
      refreshToken: data.refreshJwt,
      scopes: ['atproto'],
      metaValue: { did: data.did, handle: data.handle },
    })];
  }

  // ─── CRUD ───

  private async upsertAccount(tenantId: string, data: {
    platform: SocialPlatform;
    platformAccountId: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    pageId?: string;
    scopes?: string[];
    metaValue?: any;
  }) {
    return this.prisma.socialAccount.upsert({
      where: {
        tenantId_platform_platformAccountId: {
          tenantId,
          platform: data.platform,
          platformAccountId: data.platformAccountId,
        },
      },
      update: {
        name: data.name,
        username: data.username,
        avatarUrl: data.avatarUrl,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiresAt: data.tokenExpiresAt,
        pageId: data.pageId,
        scopes: data.scopes || [],
        metaValue: data.metaValue,
        isActive: true,
        lastSyncAt: new Date(),
        lastErrorAt: null,
        lastErrorMsg: null,
      },
      create: {
        tenantId,
        platform: data.platform,
        platformAccountId: data.platformAccountId,
        name: data.name,
        username: data.username,
        avatarUrl: data.avatarUrl,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiresAt: data.tokenExpiresAt,
        pageId: data.pageId,
        scopes: data.scopes || [],
        metaValue: data.metaValue,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.socialAccount.findMany({
      where: { tenantId },
      orderBy: [{ platform: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        name: true,
        username: true,
        avatarUrl: true,
        isActive: true,
        lastSyncAt: true,
        lastErrorMsg: true,
        tokenExpiresAt: true,
        scopes: true,
        createdAt: true,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        name: true,
        username: true,
        avatarUrl: true,
        isActive: true,
        lastSyncAt: true,
        lastErrorMsg: true,
        tokenExpiresAt: true,
        scopes: true,
        pageId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!account) throw new NotFoundException('Social account not found');
    return account;
  }

  async disconnect(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    // Remove from all groups first
    await this.prisma.socialGroupAccount.deleteMany({ where: { socialAccountId: id } });
    await this.prisma.socialAccount.delete({ where: { id } });
    return { message: 'Account disconnected' };
  }

  async manualConnect(tenantId: string, dto: ManualConnectSocialAccountDto) {
    return this.upsertAccount(tenantId, {
      platform: dto.platform as SocialPlatform,
      platformAccountId: dto.platformAccountId,
      name: dto.name,
      username: dto.username,
      avatarUrl: dto.avatarUrl,
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      pageId: dto.pageId,
      scopes: dto.scopes,
    });
  }

  // ─── Groups ───

  async findAllGroups(tenantId: string) {
    return this.prisma.socialGroup.findMany({
      where: { tenantId },
      include: {
        accounts: {
          include: {
            account: {
              select: { id: true, platform: true, name: true, avatarUrl: true, username: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createGroup(tenantId: string, dto: CreateSocialGroupDto) {
    const group = await this.prisma.socialGroup.create({
      data: {
        tenantId,
        name: dto.name,
      },
    });

    if (dto.accountIds?.length) {
      await this.prisma.socialGroupAccount.createMany({
        data: dto.accountIds.map((accountId) => ({
          socialGroupId: group.id,
          socialAccountId: accountId,
        })),
        skipDuplicates: true,
      });
    }

    return this.prisma.socialGroup.findUnique({
      where: { id: group.id },
      include: {
        accounts: {
          include: {
            account: {
              select: { id: true, platform: true, name: true, avatarUrl: true, username: true },
            },
          },
        },
      },
    });
  }

  async updateGroup(tenantId: string, id: string, dto: UpdateSocialGroupDto) {
    const group = await this.prisma.socialGroup.findFirst({ where: { id, tenantId } });
    if (!group) throw new NotFoundException('Group not found');

    if (dto.name) {
      await this.prisma.socialGroup.update({ where: { id }, data: { name: dto.name } });
    }

    if (dto.accountIds !== undefined) {
      // Replace all group members
      await this.prisma.socialGroupAccount.deleteMany({ where: { socialGroupId: id } });
      if (dto.accountIds.length > 0) {
        await this.prisma.socialGroupAccount.createMany({
          data: dto.accountIds.map((accountId) => ({
            socialGroupId: id,
            socialAccountId: accountId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.socialGroup.findUnique({
      where: { id },
      include: {
        accounts: {
          include: {
            account: {
              select: { id: true, platform: true, name: true, avatarUrl: true, username: true },
            },
          },
        },
      },
    });
  }

  async deleteGroup(tenantId: string, id: string) {
    const group = await this.prisma.socialGroup.findFirst({ where: { id, tenantId } });
    if (!group) throw new NotFoundException('Group not found');
    await this.prisma.socialGroup.delete({ where: { id } });
    return { message: 'Group deleted' };
  }
}
