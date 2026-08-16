import { PrismaService } from '@htownautos/prisma';
import { CreateNoteDto, UpdateNoteDto } from './dto/create-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import { Prisma } from '@prisma/client';
export declare class NotesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createNoteDto: CreateNoteDto, createdById: string): Promise<{
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
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
                permissions: Prisma.JsonValue | null;
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
            metaValue: Prisma.JsonValue | null;
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
        createdById: string;
        buyerId: string | null;
        dealId: string | null;
        vehicleId: string | null;
        content: string;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
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
                permissions: Prisma.JsonValue | null;
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
            metaValue: Prisma.JsonValue | null;
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
}
