"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClerkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkService = void 0;
const common_1 = require("@nestjs/common");
const backend_1 = require("@clerk/backend");
let ClerkService = ClerkService_1 = class ClerkService {
    logger = new common_1.Logger(ClerkService_1.name);
    clerk;
    constructor() {
        this.clerk = (0, backend_1.createClerkClient)({
            secretKey: process.env.CLERK_SECRET_KEY,
        });
    }
    async createUser(params) {
        const { email, password, firstName, lastName } = params;
        this.logger.log(`Creating user in Clerk: ${email}`);
        try {
            const user = await this.clerk.users.createUser({
                emailAddress: [email],
                password,
                firstName,
                lastName,
            });
            this.logger.log(`User created in Clerk with ID: ${user.id}`);
            return {
                clerkUserId: user.id,
                email,
            };
        }
        catch (error) {
            this.logger.error('Failed to create user in Clerk:', error.message);
            if (error.errors?.some((e) => e.code === 'form_identifier_exists')) {
                return this.handleExistingUser(email, password);
            }
            if (error.errors?.some((e) => e.code === 'form_password_pwned' || e.code === 'form_password_length_too_short')) {
                throw new common_1.BadRequestException('Password does not meet requirements. Must be at least 8 characters and not commonly used.');
            }
            throw new common_1.BadRequestException(`Failed to create account: ${error.message || 'Unknown error'}`);
        }
    }
    async createOrganization(params) {
        this.logger.log(`Creating Clerk organization: ${params.name}`);
        const org = await this.clerk.organizations.createOrganization({
            name: params.name,
            createdBy: params.createdBy,
            publicMetadata: params.publicMetadata || {},
        });
        this.logger.log(`Clerk organization created: ${org.id}`);
        return org;
    }
    async deleteOrganization(orgId) {
        this.logger.log(`Deleting Clerk organization: ${orgId}`);
        await this.clerk.organizations.deleteOrganization(orgId);
        this.logger.log(`Clerk organization deleted: ${orgId}`);
    }
    async inviteToOrganization(params) {
        this.logger.log(`Inviting ${params.emailAddress} to org ${params.organizationId}`);
        try {
            const invitation = await this.clerk.organizations.createOrganizationInvitation({
                organizationId: params.organizationId,
                emailAddress: params.emailAddress,
                role: params.role,
                inviterUserId: params.inviterUserId,
            });
            this.logger.log(`Clerk org invitation created: ${invitation.id}`);
            return invitation;
        }
        catch (error) {
            const details = error.errors?.map((e) => `${e.code}: ${e.longMessage || e.message}`).join(', ') || error.message;
            this.logger.error(`Failed to invite to org: ${details}`);
            throw error;
        }
    }
    async removeFromOrganization(organizationId, clerkUserId) {
        this.logger.log(`Removing ${clerkUserId} from org ${organizationId}`);
        try {
            await this.clerk.organizations.deleteOrganizationMembership({
                organizationId,
                userId: clerkUserId,
            });
            this.logger.log(`Removed ${clerkUserId} from org ${organizationId}`);
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`User ${clerkUserId} not found in org ${organizationId}, already removed`);
                return;
            }
            this.logger.error(`Failed to remove from org: ${error.message}`);
            throw error;
        }
    }
    async updateOrganizationMemberRole(organizationId, clerkUserId, role) {
        this.logger.log(`Updating ${clerkUserId} role to ${role} in org ${organizationId}`);
        try {
            await this.clerk.organizations.updateOrganizationMembership({
                organizationId,
                userId: clerkUserId,
                role,
            });
        }
        catch (error) {
            this.logger.error(`Failed to update org member role: ${error.message}`);
            throw error;
        }
    }
    async addOrganizationMembership(organizationId, clerkUserId, role) {
        this.logger.log(`Adding ${clerkUserId} to org ${organizationId} with role ${role}`);
        try {
            await this.clerk.organizations.createOrganizationMembership({
                organizationId,
                userId: clerkUserId,
                role,
            });
            this.logger.log(`Added ${clerkUserId} to org ${organizationId}`);
        }
        catch (error) {
            const alreadyMember = error.errors?.some((e) => e.code === 'already_a_member_in_organization' || e.code === 'duplicate_record');
            if (alreadyMember || error.status === 422 || error.status === 409) {
                this.logger.warn(`User ${clerkUserId} is already a member of org ${organizationId} — skipping`);
                return;
            }
            this.logger.error(`Failed to add org membership: ${error.message}`);
            throw error;
        }
    }
    async revokeOrganizationInvitation(organizationId, invitationId, requestingUserId) {
        this.logger.log(`Revoking invitation ${invitationId} in org ${organizationId}`);
        try {
            await this.clerk.organizations.revokeOrganizationInvitation({
                organizationId,
                invitationId,
                requestingUserId,
            });
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Invitation ${invitationId} not found, already revoked`);
                return;
            }
            this.logger.error(`Failed to revoke invitation: ${error.message}`);
            throw error;
        }
    }
    async handleExistingUser(email, password) {
        try {
            const users = await this.clerk.users.getUserList({
                emailAddress: [email],
            });
            if (!users.data.length) {
                throw new Error('User not found despite existing email');
            }
            const user = users.data[0];
            await this.clerk.users.updateUser(user.id, { password });
            this.logger.log(`Updated password for existing Clerk user: ${user.id}`);
            return {
                clerkUserId: user.id,
                email,
            };
        }
        catch (error) {
            this.logger.error('Failed to handle existing user:', error.message);
            if (error.errors?.some((e) => e.code === 'form_password_pwned' || e.code === 'form_password_length_too_short')) {
                throw new common_1.BadRequestException('Password does not meet requirements. Must be at least 8 characters and not commonly used.');
            }
            throw new common_1.BadRequestException(`Failed to process account: ${error.message || 'Unknown error'}`);
        }
    }
};
exports.ClerkService = ClerkService;
exports.ClerkService = ClerkService = ClerkService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ClerkService);
//# sourceMappingURL=clerk.service.js.map