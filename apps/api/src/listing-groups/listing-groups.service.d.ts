import { PrismaService } from '@htownautos/prisma';
import { CreateListingGroupDto, UpdateListingGroupDto } from './dto/create-listing-group.dto';
export declare class ListingGroupsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<({
        _count: {
            items: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        userId: string;
    })[]>;
    create(tenantId: string, userId: string, dto: CreateListingGroupDto): Promise<{
        _count: {
            items: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        userId: string;
    }>;
    update(tenantId: string, id: string, dto: UpdateListingGroupDto): Promise<{
        _count: {
            items: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        userId: string;
    }>;
    remove(tenantId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    getItems(tenantId: string, groupId: string): Promise<{
        groupId: string;
        lotNumbers: string[];
    }>;
    addItems(tenantId: string, groupId: string, lotNumbers: string[]): Promise<{
        added: number;
    }>;
    removeItem(tenantId: string, groupId: string, lotNumber: string): Promise<{
        removed: boolean;
    }>;
    getGroupsForLot(tenantId: string, lotNumber: string): Promise<{
        groups: {
            name: string;
            id: string;
        }[];
        count: number;
    }>;
}
