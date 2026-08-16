import { SocialAccountsService } from './social-accounts.service';
import { ConnectSocialAccountDto, ManualConnectSocialAccountDto, CreateSocialGroupDto, UpdateSocialGroupDto, SocialPlatform } from './dto';
export declare class SocialAccountsController {
    private readonly service;
    constructor(service: SocialAccountsService);
    getOAuthUrl(tenantId: string, platform: SocialPlatform, redirectUri: string): {
        url: string;
    };
    connect(tenantId: string, dto: ConnectSocialAccountDto): Promise<any[]>;
    connectBluesky(tenantId: string, body: {
        identifier: string;
        appPassword: string;
    }): Promise<{
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
