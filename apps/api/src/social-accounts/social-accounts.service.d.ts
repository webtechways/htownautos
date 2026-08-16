import { PrismaService } from '@htownautos/prisma';
import { ManualConnectSocialAccountDto, CreateSocialGroupDto, UpdateSocialGroupDto, SocialPlatform } from './dto';
export declare class SocialAccountsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOAuthUrl(platform: SocialPlatform, tenantId: string, redirectUri: string): string;
    exchangeOAuthCode(platform: SocialPlatform, code: string, redirectUri: string, tenantId: string): Promise<any[]>;
    private exchangeFacebookCode;
    private exchangeTikTokCode;
    private exchangeGoogleCode;
    private exchangeLinkedInCode;
    private exchangePinterestCode;
    private exchangeThreadsCode;
    connectBluesky(tenantId: string, identifier: string, appPassword: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        lastSyncAt: Date | null;
        lastErrorAt: Date | null;
        lastErrorMsg: string | null;
        username: string | null;
        platform: string;
        platformAccountId: string;
        avatarUrl: string | null;
        accessToken: string | null;
        refreshToken: string | null;
        tokenExpiresAt: Date | null;
        scopes: string[];
        pageId: string | null;
    }[]>;
    private upsertAccount;
    findAll(tenantId: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        lastSyncAt: Date | null;
        lastErrorMsg: string | null;
        username: string | null;
        platform: string;
        platformAccountId: string;
        avatarUrl: string | null;
        tokenExpiresAt: Date | null;
        scopes: string[];
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastSyncAt: Date | null;
        lastErrorMsg: string | null;
        username: string | null;
        platform: string;
        platformAccountId: string;
        avatarUrl: string | null;
        tokenExpiresAt: Date | null;
        scopes: string[];
        pageId: string | null;
    }>;
    disconnect(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    manualConnect(tenantId: string, dto: ManualConnectSocialAccountDto): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        lastSyncAt: Date | null;
        lastErrorAt: Date | null;
        lastErrorMsg: string | null;
        username: string | null;
        platform: string;
        platformAccountId: string;
        avatarUrl: string | null;
        accessToken: string | null;
        refreshToken: string | null;
        tokenExpiresAt: Date | null;
        scopes: string[];
        pageId: string | null;
    }>;
    findAllGroups(tenantId: string): Promise<({
        accounts: ({
            account: {
                name: string;
                id: string;
                username: string | null;
                platform: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            socialGroupId: string;
            socialAccountId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    })[]>;
    createGroup(tenantId: string, dto: CreateSocialGroupDto): Promise<({
        accounts: ({
            account: {
                name: string;
                id: string;
                username: string | null;
                platform: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            socialGroupId: string;
            socialAccountId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }) | null>;
    updateGroup(tenantId: string, id: string, dto: UpdateSocialGroupDto): Promise<({
        accounts: ({
            account: {
                name: string;
                id: string;
                username: string | null;
                platform: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            socialGroupId: string;
            socialAccountId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }) | null>;
    deleteGroup(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
