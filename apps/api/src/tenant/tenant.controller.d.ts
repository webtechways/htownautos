import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { QueryTenantDto } from './dto/query-tenant.dto';
import { AddUserToTenantDto, UpdateTenantUserDto, InviteUserToTenantDto, AcceptInvitationDto, ResendInvitationDto, RegisterWithInvitationDto } from './dto/add-user-to-tenant.dto';
import { SearchPhoneNumbersDto, PurchasePhoneNumberDto, UpdatePhoneNumberDto } from './dto/phone-number.dto';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    getMyTenants(user: {
        id: string;
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        subdomain: string | null;
        businessName: string | null;
        logo: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        isActive: boolean;
        role: {
            name: string;
            id: string;
            slug: string;
        };
        isOwner: boolean;
    }[]>;
    create(createTenantDto: CreateTenantDto, user: {
        id: string;
    }): Promise<({
        users: ({
            user: {
                name: string | null;
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
            role: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        })[];
    } & {
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        clerkOrgId: string | null;
        subdomain: string | null;
        businessName: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
        twilioMessagingServiceSid: string | null;
        logo: string | null;
        deletedAt: Date | null;
        postmarkDomainId: number | null;
        postmarkDkimVerified: boolean;
        postmarkReturnPathVerified: boolean;
        emailProvisionedAt: Date | null;
        cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
        postmarkServerId: number | null;
        postmarkServerToken: string | null;
        postmarkWebhookId: number | null;
    }) | null>;
    findAll(query: QueryTenantDto): Promise<{
        data: {
            name: string;
            id: string;
            slug: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            clerkOrgId: string | null;
            subdomain: string | null;
            businessName: string | null;
            taxId: string | null;
            phone: string | null;
            email: string | null;
            website: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            zipCode: string | null;
            country: string;
            settings: import("@prisma/client/runtime/client").JsonValue | null;
            feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
            twilioMessagingServiceSid: string | null;
            logo: string | null;
            deletedAt: Date | null;
            postmarkDomainId: number | null;
            postmarkDkimVerified: boolean;
            postmarkReturnPathVerified: boolean;
            emailProvisionedAt: Date | null;
            cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
            postmarkServerId: number | null;
            postmarkServerToken: string | null;
            postmarkWebhookId: number | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    checkSlugAvailability(slug: string): Promise<{
        available: boolean;
    }>;
    checkSubdomainAvailability(subdomain: string): Promise<{
        available: boolean;
    }>;
    checkUsernameAvailability(id: string, username: string): Promise<{
        available: boolean;
    }>;
    findBySlug(slug: string): Promise<{
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        clerkOrgId: string | null;
        subdomain: string | null;
        businessName: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
        twilioMessagingServiceSid: string | null;
        logo: string | null;
        deletedAt: Date | null;
        postmarkDomainId: number | null;
        postmarkDkimVerified: boolean;
        postmarkReturnPathVerified: boolean;
        emailProvisionedAt: Date | null;
        cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
        postmarkServerId: number | null;
        postmarkServerToken: string | null;
        postmarkWebhookId: number | null;
    }>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        clerkOrgId: string | null;
        subdomain: string | null;
        businessName: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
        twilioMessagingServiceSid: string | null;
        logo: string | null;
        deletedAt: Date | null;
        postmarkDomainId: number | null;
        postmarkDkimVerified: boolean;
        postmarkReturnPathVerified: boolean;
        emailProvisionedAt: Date | null;
        cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
        postmarkServerId: number | null;
        postmarkServerToken: string | null;
        postmarkWebhookId: number | null;
    }>;
    findOneWithStats(id: string): Promise<{
        userCount: number;
        vehicleCount: number;
        dealCount: number;
        buyerCount: number;
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        clerkOrgId: string | null;
        subdomain: string | null;
        businessName: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
        twilioMessagingServiceSid: string | null;
        logo: string | null;
        deletedAt: Date | null;
        postmarkDomainId: number | null;
        postmarkDkimVerified: boolean;
        postmarkReturnPathVerified: boolean;
        emailProvisionedAt: Date | null;
        cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
        postmarkServerId: number | null;
        postmarkServerToken: string | null;
        postmarkWebhookId: number | null;
    }>;
    getUsers(id: string, roles?: string): Promise<({
        user: {
            name: string | null;
            id: string;
            isActive: boolean;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
            lastLoginAt: Date | null;
        };
        role: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        status: string;
        username: string | null;
        tenantEmail: string | null;
        extension: string | null;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
        roleId: string;
        acceptedAt: Date | null;
        invitationCode: string | null;
        invitationSentAt: Date | null;
        invitedBy: string | null;
        removedAt: Date | null;
    })[]>;
    getStaff(id: string, roles?: string): Promise<({
        user: {
            name: string | null;
            id: string;
            isActive: boolean;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
            lastLoginAt: Date | null;
        };
        role: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        status: string;
        username: string | null;
        tenantEmail: string | null;
        extension: string | null;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
        roleId: string;
        acceptedAt: Date | null;
        invitationCode: string | null;
        invitationSentAt: Date | null;
        invitedBy: string | null;
        removedAt: Date | null;
    })[]>;
    getPhoneNumbers(id: string): Promise<({
        assignedTo: {
            id: string;
            user: {
                name: string | null;
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } | null;
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        assignedToId: string | null;
        phoneNumber: string;
        twilioSid: string;
        friendlyName: string | null;
        canVoice: boolean;
        canSms: boolean;
        canMms: boolean;
        callFlowId: string | null;
        isPrimary: boolean;
    })[]>;
    searchAvailablePhoneNumbers(id: string, query: SearchPhoneNumbersDto): Promise<import("../twilio/twilio.service").AvailablePhoneNumber[]>;
    purchasePhoneNumber(id: string, dto: PurchasePhoneNumberDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        assignedToId: string | null;
        phoneNumber: string;
        twilioSid: string;
        friendlyName: string | null;
        canVoice: boolean;
        canSms: boolean;
        canMms: boolean;
        callFlowId: string | null;
        isPrimary: boolean;
    }>;
    updatePhoneNumber(id: string, phoneNumberId: string, dto: UpdatePhoneNumberDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        assignedToId: string | null;
        phoneNumber: string;
        twilioSid: string;
        friendlyName: string | null;
        canVoice: boolean;
        canSms: boolean;
        canMms: boolean;
        callFlowId: string | null;
        isPrimary: boolean;
    }>;
    deletePhoneNumber(id: string, phoneNumberId: string): Promise<{
        message: string;
    }>;
    getAvailableRoles(id: string): Promise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isSystem: boolean;
    }[]>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<{
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        clerkOrgId: string | null;
        subdomain: string | null;
        businessName: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
        twilioMessagingServiceSid: string | null;
        logo: string | null;
        deletedAt: Date | null;
        postmarkDomainId: number | null;
        postmarkDkimVerified: boolean;
        postmarkReturnPathVerified: boolean;
        emailProvisionedAt: Date | null;
        cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
        postmarkServerId: number | null;
        postmarkServerToken: string | null;
        postmarkWebhookId: number | null;
    }>;
    updateSettings(id: string, settings: Record<string, any>): Promise<{
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        clerkOrgId: string | null;
        subdomain: string | null;
        businessName: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
        twilioMessagingServiceSid: string | null;
        logo: string | null;
        deletedAt: Date | null;
        postmarkDomainId: number | null;
        postmarkDkimVerified: boolean;
        postmarkReturnPathVerified: boolean;
        emailProvisionedAt: Date | null;
        cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
        postmarkServerId: number | null;
        postmarkServerToken: string | null;
        postmarkWebhookId: number | null;
    }>;
    activate(id: string): Promise<{
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        clerkOrgId: string | null;
        subdomain: string | null;
        businessName: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
        twilioMessagingServiceSid: string | null;
        logo: string | null;
        deletedAt: Date | null;
        postmarkDomainId: number | null;
        postmarkDkimVerified: boolean;
        postmarkReturnPathVerified: boolean;
        emailProvisionedAt: Date | null;
        cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
        postmarkServerId: number | null;
        postmarkServerToken: string | null;
        postmarkWebhookId: number | null;
    }>;
    deactivate(id: string): Promise<{
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        clerkOrgId: string | null;
        subdomain: string | null;
        businessName: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        feeConfig: import("@prisma/client/runtime/client").JsonValue | null;
        twilioMessagingServiceSid: string | null;
        logo: string | null;
        deletedAt: Date | null;
        postmarkDomainId: number | null;
        postmarkDkimVerified: boolean;
        postmarkReturnPathVerified: boolean;
        emailProvisionedAt: Date | null;
        cloudflareDnsRecordIds: import("@prisma/client/runtime/client").JsonValue | null;
        postmarkServerId: number | null;
        postmarkServerToken: string | null;
        postmarkWebhookId: number | null;
    }>;
    remove(id: string, user: {
        id: string;
    }): Promise<{
        message: string;
    }>;
    addUserToTenant(tenantId: string, addUserDto: AddUserToTenantDto, user: {
        id: string;
    }): Promise<{
        user: {
            name: string | null;
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
        };
        role: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        status: string;
        username: string | null;
        tenantEmail: string | null;
        extension: string | null;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
        roleId: string;
        acceptedAt: Date | null;
        invitationCode: string | null;
        invitationSentAt: Date | null;
        invitedBy: string | null;
        removedAt: Date | null;
    }>;
    updateTenantUser(tenantId: string, userId: string, updateDto: UpdateTenantUserDto, user: {
        id: string;
    }): Promise<{
        user: {
            name: string | null;
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
        };
        role: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        status: string;
        username: string | null;
        tenantEmail: string | null;
        extension: string | null;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
        roleId: string;
        acceptedAt: Date | null;
        invitationCode: string | null;
        invitationSentAt: Date | null;
        invitedBy: string | null;
        removedAt: Date | null;
    }>;
    removeUserFromTenant(tenantId: string, userId: string, user: {
        id: string;
    }): Promise<{
        message: string;
    }>;
    transferOwnership(tenantId: string, newOwnerId: string, user: {
        id: string;
    }): Promise<{
        message: string;
        previousOwnerId: string;
        newOwnerId: string;
    }>;
    getMyInvitations(user: {
        id: string;
        email: string;
    }): Promise<{
        id: string;
        tenantId: string;
        tenantName: string;
        roleName: string;
        roleSlug: string;
        invitedBy: {
            id: string;
            name: string;
        } | null;
        invitedAt: Date | null;
        invitationCode: string | null;
    }[]>;
    acceptMyInvitation(tenantUserId: string, user: {
        id: string;
        email: string;
        clerkUserId: string;
    }): Promise<{
        message: string;
        tenantUser: {
            id: any;
            status: any;
            acceptedAt: any;
            tenant: any;
            user: any;
            role: any;
        };
    }>;
    declineMyInvitation(tenantUserId: string, user: {
        id: string;
        email: string;
    }): Promise<{
        ok: boolean;
    }>;
    inviteUserToTenant(tenantId: string, inviteDto: InviteUserToTenantDto, user: {
        id: string;
    }): Promise<{
        message: string;
        invitation: {
            id: any;
            email: any;
            status: any;
            invitationSentAt: any;
            role: any;
        };
        user: {
            id: any;
            email: any;
        };
        _debug: {
            invitationCode: string;
            invitationUrl: string;
        };
    }>;
    resendInvitation(tenantId: string, resendDto: ResendInvitationDto, user: {
        id: string;
    }): Promise<{
        message: string;
        invitationSentAt: Date | null;
        _debug: {
            invitationCode: string;
            invitationUrl: string;
        };
    }>;
    revokeInvitation(tenantId: string, userId: string, user: {
        id: string;
    }): Promise<{
        message: string;
    }>;
    getPendingInvitations(tenantId: string, user: {
        id: string;
    }): Promise<({
        user: {
            name: string | null;
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
        role: {
            name: string;
            id: string;
            slug: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        status: string;
        username: string | null;
        tenantEmail: string | null;
        extension: string | null;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
        roleId: string;
        acceptedAt: Date | null;
        invitationCode: string | null;
        invitationSentAt: Date | null;
        invitedBy: string | null;
        removedAt: Date | null;
    })[]>;
    getFeeConfig(id: string, user: {
        id: string;
    }): Promise<import("./fee-config.default").FeeConfig>;
    updateFeeConfig(id: string, dto: Record<string, any>, user: {
        id: string;
    }): Promise<import("./fee-config.default").FeeConfig>;
}
export declare class InvitationController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    getInvitationDetails(code: string): Promise<{
        type: string;
        id: string;
        email: string;
        tenant: {
            name: string;
            id: string;
            slug: string;
        };
        role: {
            name: string;
            id: string;
            slug: string;
        };
        userExists: boolean;
        requiresRegistration: boolean;
    }>;
    acceptInvitation(acceptDto: AcceptInvitationDto, user: {
        id: string;
        email: string;
        clerkUserId: string;
    }): Promise<{
        message: string;
        tenantUser: {
            id: any;
            status: any;
            acceptedAt: any;
            tenant: any;
            user: any;
            role: any;
        };
    }>;
    registerAndAcceptInvitation(registerDto: RegisterWithInvitationDto): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
        };
        tenantUser: {
            id: any;
            status: any;
            acceptedAt: any;
            tenant: any;
            role: any;
        };
    }>;
}
