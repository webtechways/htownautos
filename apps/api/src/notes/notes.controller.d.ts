import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/create-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import type { AuthenticatedUser } from '@htownautos/auth';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    private getTenantUserId;
    create(tenantId: string, createNoteDto: CreateNoteDto, user: AuthenticatedUser): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        createdById: string;
        buyerId: string | null;
        dealId: string | null;
        vehicleId: string | null;
        content: string;
    }>;
    findAll(tenantId: string, query: QueryNoteDto): Promise<{
        data: ({
            buyer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
            createdBy: {
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            createdById: string;
            buyerId: string | null;
            dealId: string | null;
            vehicleId: string | null;
            content: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByBuyer(tenantId: string, buyerId: string, query: QueryNoteDto): Promise<{
        data: ({
            buyer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
            createdBy: {
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            createdById: string;
            buyerId: string | null;
            dealId: string | null;
            vehicleId: string | null;
            content: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        createdById: string;
        buyerId: string | null;
        dealId: string | null;
        vehicleId: string | null;
        content: string;
    }>;
    update(tenantId: string, id: string, updateNoteDto: UpdateNoteDto): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        createdById: string;
        buyerId: string | null;
        dealId: string | null;
        vehicleId: string | null;
        content: string;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
