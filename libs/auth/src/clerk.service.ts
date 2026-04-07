import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';

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

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private clerk: ReturnType<typeof createClerkClient>;

  constructor() {
    this.clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
  }

  /**
   * Create a new user in Clerk or return existing user
   */
  async createUser(params: CreateUserParams): Promise<CreateUserResult> {
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
    } catch (error: any) {
      this.logger.error('Failed to create user in Clerk:', error.message);

      // Handle Clerk-specific errors
      if (error.errors?.some((e: any) => e.code === 'form_identifier_exists')) {
        // User already exists - find them and update password
        return this.handleExistingUser(email, password);
      }

      if (error.errors?.some((e: any) => e.code === 'form_password_pwned' || e.code === 'form_password_length_too_short')) {
        throw new BadRequestException(
          'Password does not meet requirements. Must be at least 8 characters and not commonly used.',
        );
      }

      throw new BadRequestException(
        `Failed to create account: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Create a Clerk Organization and add the creator as admin
   */
  async createOrganization(params: {
    name: string;
    createdBy: string;
    publicMetadata?: Record<string, any>;
  }) {
    this.logger.log(`Creating Clerk organization: ${params.name}`);

    const org = await this.clerk.organizations.createOrganization({
      name: params.name,
      createdBy: params.createdBy,
      publicMetadata: params.publicMetadata || {},
    });

    this.logger.log(`Clerk organization created: ${org.id}`);
    return org;
  }

  /**
   * Delete a Clerk Organization
   */
  async deleteOrganization(orgId: string) {
    this.logger.log(`Deleting Clerk organization: ${orgId}`);
    await this.clerk.organizations.deleteOrganization(orgId);
    this.logger.log(`Clerk organization deleted: ${orgId}`);
  }

  /**
   * Invite a user to a Clerk Organization by email.
   * Clerk sends the invitation email automatically.
   */
  async inviteToOrganization(params: {
    organizationId: string;
    emailAddress: string;
    role: string;
    inviterUserId: string;
  }) {
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
    } catch (error: any) {
      const details = error.errors?.map((e: any) => `${e.code}: ${e.longMessage || e.message}`).join(', ') || error.message;
      this.logger.error(`Failed to invite to org: ${details}`);
      throw error;
    }
  }

  /**
   * Remove a user from a Clerk Organization.
   */
  async removeFromOrganization(organizationId: string, clerkUserId: string) {
    this.logger.log(`Removing ${clerkUserId} from org ${organizationId}`);
    try {
      await this.clerk.organizations.deleteOrganizationMembership({
        organizationId,
        userId: clerkUserId,
      });
      this.logger.log(`Removed ${clerkUserId} from org ${organizationId}`);
    } catch (error: any) {
      // If already removed, ignore
      if (error.status === 404) {
        this.logger.warn(`User ${clerkUserId} not found in org ${organizationId}, already removed`);
        return;
      }
      this.logger.error(`Failed to remove from org: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a user's role in a Clerk Organization.
   */
  async updateOrganizationMemberRole(organizationId: string, clerkUserId: string, role: string) {
    this.logger.log(`Updating ${clerkUserId} role to ${role} in org ${organizationId}`);
    try {
      await this.clerk.organizations.updateOrganizationMembership({
        organizationId,
        userId: clerkUserId,
        role,
      });
    } catch (error: any) {
      this.logger.error(`Failed to update org member role: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revoke a pending invitation to a Clerk Organization.
   */
  async revokeOrganizationInvitation(organizationId: string, invitationId: string, requestingUserId: string) {
    this.logger.log(`Revoking invitation ${invitationId} in org ${organizationId}`);
    try {
      await this.clerk.organizations.revokeOrganizationInvitation({
        organizationId,
        invitationId,
        requestingUserId,
      });
    } catch (error: any) {
      if (error.status === 404) {
        this.logger.warn(`Invitation ${invitationId} not found, already revoked`);
        return;
      }
      this.logger.error(`Failed to revoke invitation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle existing user - find by email and update password
   */
  private async handleExistingUser(email: string, password: string): Promise<CreateUserResult> {
    try {
      const users = await this.clerk.users.getUserList({
        emailAddress: [email],
      });

      if (!users.data.length) {
        throw new Error('User not found despite existing email');
      }

      const user = users.data[0];

      // Update their password
      await this.clerk.users.updateUser(user.id, { password });

      this.logger.log(`Updated password for existing Clerk user: ${user.id}`);

      return {
        clerkUserId: user.id,
        email,
      };
    } catch (error: any) {
      this.logger.error('Failed to handle existing user:', error.message);

      if (error.errors?.some((e: any) => e.code === 'form_password_pwned' || e.code === 'form_password_length_too_short')) {
        throw new BadRequestException(
          'Password does not meet requirements. Must be at least 8 characters and not commonly used.',
        );
      }

      throw new BadRequestException(
        `Failed to process account: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
