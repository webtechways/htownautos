export declare enum SocialPlatform {
    FACEBOOK = "facebook",
    INSTAGRAM = "instagram",
    TIKTOK = "tiktok",
    YOUTUBE = "youtube",
    LINKEDIN = "linkedin",
    PINTEREST = "pinterest",
    THREADS = "threads",
    BLUESKY = "bluesky",
    GBP = "gbp"
}
export declare class ConnectSocialAccountDto {
    platform: SocialPlatform;
    code: string;
    redirectUri?: string;
}
export declare class ManualConnectSocialAccountDto {
    platform: SocialPlatform;
    platformAccountId: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    pageId?: string;
    scopes?: string[];
}
export declare class CreateSocialGroupDto {
    name: string;
    accountIds?: string[];
}
export declare class UpdateSocialGroupDto {
    name?: string;
    accountIds?: string[];
}
