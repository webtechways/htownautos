interface CreateUserParams {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
interface CreateUserResult {
    clerkUserId: string;
    email: string;
}
export declare class ClerkService {
    private readonly logger;
    private clerk;
    constructor();
    createUser(params: CreateUserParams): Promise<CreateUserResult>;
    createOrganization(params: {
        name: string;
        createdBy: string;
        publicMetadata?: Record<string, any>;
    }): Promise<import("@clerk/backend").Organization>;
    deleteOrganization(orgId: string): Promise<void>;
    inviteToOrganization(params: {
        organizationId: string;
        emailAddress: string;
        role: string;
        inviterUserId: string;
    }): Promise<import("@clerk/backend").OrganizationInvitation>;
    removeFromOrganization(organizationId: string, clerkUserId: string): Promise<void>;
    updateOrganizationMemberRole(organizationId: string, clerkUserId: string, role: string): Promise<void>;
    addOrganizationMembership(organizationId: string, clerkUserId: string, role: string): Promise<void>;
    revokeOrganizationInvitation(organizationId: string, invitationId: string, requestingUserId: string): Promise<void>;
    private handleExistingUser;
}
export {};
