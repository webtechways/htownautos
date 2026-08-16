export declare class AddUserToTenantDto {
    userId: string;
    username: string;
    roleId: string;
    permissions?: Record<string, any>;
    isActive?: boolean;
}
export declare class InviteUserToTenantDto {
    email: string;
    username: string;
    roleId: string;
    permissions?: Record<string, any>;
}
export declare class UpdateTenantUserDto {
    username?: string;
    extension?: string | null;
    roleId?: string;
    permissions?: Record<string, any>;
    isActive?: boolean;
}
export declare class AcceptInvitationDto {
    code: string;
}
export declare class ResendInvitationDto {
    userId: string;
}
export declare class RegisterWithInvitationDto {
    code: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
