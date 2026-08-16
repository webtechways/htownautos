import { YardsService } from './yards.service';
import { CreateYardDto } from './dto/create-yard.dto';
import { UpdateYardDto } from './dto/update-yard.dto';
import { QueryYardsDto } from './dto/query-yards.dto';
export declare class YardsController {
    private readonly service;
    constructor(service: YardsService);
    list(query: QueryYardsDto): Promise<{
        data: ({
            _count: {
                inspections: number;
                auctionListings: number;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            country: string | null;
            source: import("@prisma/client").$Enums.YardSource;
            yardNumber: number;
            zip: string | null;
            latitude: number | null;
            longitude: number | null;
            contactName: string | null;
            physicalInspectionAvailable: boolean;
            hours: import("@prisma/client/runtime/client").JsonValue | null;
            travelFeeCents: number;
            minCars: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            totalsByFlag: {
                withPhysical: number;
                withoutPhysical: number;
            };
        };
    }>;
    get(id: string): Promise<{
        _count: {
            inspections: number;
            auctionListings: number;
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        source: import("@prisma/client").$Enums.YardSource;
        yardNumber: number;
        zip: string | null;
        latitude: number | null;
        longitude: number | null;
        contactName: string | null;
        physicalInspectionAvailable: boolean;
        hours: import("@prisma/client/runtime/client").JsonValue | null;
        travelFeeCents: number;
        minCars: number;
    }>;
    create(dto: CreateYardDto): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        source: import("@prisma/client").$Enums.YardSource;
        yardNumber: number;
        zip: string | null;
        latitude: number | null;
        longitude: number | null;
        contactName: string | null;
        physicalInspectionAvailable: boolean;
        hours: import("@prisma/client/runtime/client").JsonValue | null;
        travelFeeCents: number;
        minCars: number;
    }>;
    update(id: string, dto: UpdateYardDto): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        source: import("@prisma/client").$Enums.YardSource;
        yardNumber: number;
        zip: string | null;
        latitude: number | null;
        longitude: number | null;
        contactName: string | null;
        physicalInspectionAvailable: boolean;
        hours: import("@prisma/client/runtime/client").JsonValue | null;
        travelFeeCents: number;
        minCars: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
