import { ListingGroupsService } from './listing-groups.service';
import { CreateListingGroupDto, UpdateListingGroupDto } from './dto/create-listing-group.dto';
import { AddItemsToGroupDto } from './dto/manage-group-items.dto';
export declare class ListingGroupsController {
    private readonly service;
    constructor(service: ListingGroupsService);
    findAll(tenantId: string): Promise<{
        data: ({
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
        })[];
    }>;
    create(tenantId: string, user: {
        id: string;
    }, dto: CreateListingGroupDto): Promise<{
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
    getGroupsForLot(tenantId: string, lotNumber: string): Promise<{
        groups: {
            name: string;
            id: string;
        }[];
        count: number;
    }>;
    getItems(tenantId: string, id: string): Promise<{
        groupId: string;
        lotNumbers: string[];
    }>;
    addItems(tenantId: string, id: string, dto: AddItemsToGroupDto): Promise<{
        added: number;
    }>;
    removeItem(tenantId: string, id: string, lotNumber: string): Promise<{
        removed: boolean;
    }>;
}
