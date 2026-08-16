import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import type { AuthenticatedUser } from '@htownautos/auth';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    private getTenantUserId;
    create(tenantId: string, createTaskDto: CreateTaskDto, user: AuthenticatedUser): Promise<{
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
        assignedTo: {
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
        title: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        createdById: string;
        buyerId: string | null;
        dealId: string | null;
        vehicleId: string | null;
        assignedToId: string;
        dueDate: Date | null;
        completedAt: Date | null;
        priority: string;
        status: string;
        dueTime: string | null;
    }>;
    findAll(tenantId: string, query: QueryTaskDto): Promise<{
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
            assignedTo: {
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
            title: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            description: string | null;
            notes: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            createdById: string;
            buyerId: string | null;
            dealId: string | null;
            vehicleId: string | null;
            assignedToId: string;
            dueDate: Date | null;
            completedAt: Date | null;
            priority: string;
            status: string;
            dueTime: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getMyTasks(tenantId: string, user: AuthenticatedUser, query: QueryTaskDto): Promise<{
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
            assignedTo: {
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
            title: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            description: string | null;
            notes: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            createdById: string;
            buyerId: string | null;
            dealId: string | null;
            vehicleId: string | null;
            assignedToId: string;
            dueDate: Date | null;
            completedAt: Date | null;
            priority: string;
            status: string;
            dueTime: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByBuyer(tenantId: string, buyerId: string, query: QueryTaskDto): Promise<{
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
            assignedTo: {
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
            title: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            description: string | null;
            notes: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            createdById: string;
            buyerId: string | null;
            dealId: string | null;
            vehicleId: string | null;
            assignedToId: string;
            dueDate: Date | null;
            completedAt: Date | null;
            priority: string;
            status: string;
            dueTime: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByVehicle(tenantId: string, vehicleId: string, query: QueryTaskDto): Promise<{
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
            assignedTo: {
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
            title: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            description: string | null;
            notes: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            createdById: string;
            buyerId: string | null;
            dealId: string | null;
            vehicleId: string | null;
            assignedToId: string;
            dueDate: Date | null;
            completedAt: Date | null;
            priority: string;
            status: string;
            dueTime: string | null;
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
            phoneMain: string;
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
        assignedTo: {
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
        title: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        createdById: string;
        buyerId: string | null;
        dealId: string | null;
        vehicleId: string | null;
        assignedToId: string;
        dueDate: Date | null;
        completedAt: Date | null;
        priority: string;
        status: string;
        dueTime: string | null;
    }>;
    update(tenantId: string, id: string, updateTaskDto: UpdateTaskDto, user: AuthenticatedUser): Promise<{
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
        assignedTo: {
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
        title: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        createdById: string;
        buyerId: string | null;
        dealId: string | null;
        vehicleId: string | null;
        assignedToId: string;
        dueDate: Date | null;
        completedAt: Date | null;
        priority: string;
        status: string;
        dueTime: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
