import { InventoryAssetsService } from './inventory-assets.service';
import { CreateInventoryAssetDto, UpdateInventoryAssetDto, QueryInventoryAssetDto } from './dto';
export declare class InventoryAssetsController {
    private readonly service;
    constructor(service: InventoryAssetsService);
    create(tenantId: string, dto: CreateInventoryAssetDto): Promise<{
        model: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        purchaseDate: Date | null;
        status: string;
        shippingCost: import("@prisma/client-runtime-utils").Decimal | null;
        tax: import("@prisma/client-runtime-utils").Decimal | null;
        category: string | null;
        quantity: number;
        location: string | null;
        supplier: string | null;
        brand: string | null;
        assetTag: string | null;
        serialNumber: string | null;
        condition: string;
        assignedTo: string | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        currentValue: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        receiptIds: string[];
        imageUrl: string | null;
    }>;
    analyzeUrl(body: {
        url: string;
    }): Promise<any>;
    analyzeImages(body: {
        mediaIds: string[];
    }): Promise<any>;
    analyzeReceiptItems(body: {
        mediaIds: string[];
    }): Promise<any>;
    bulkCreate(tenantId: string, body: {
        assets: CreateInventoryAssetDto[];
    }): Promise<{
        count: number;
        assets: any[];
    }>;
    getStats(tenantId: string): Promise<{
        totalItems: number;
        totalValue: number;
    }>;
    findAll(tenantId: string, query: QueryInventoryAssetDto): Promise<{
        data: {
            model: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            description: string | null;
            notes: string | null;
            purchaseDate: Date | null;
            status: string;
            shippingCost: import("@prisma/client-runtime-utils").Decimal | null;
            tax: import("@prisma/client-runtime-utils").Decimal | null;
            category: string | null;
            quantity: number;
            location: string | null;
            supplier: string | null;
            brand: string | null;
            assetTag: string | null;
            serialNumber: string | null;
            condition: string;
            assignedTo: string | null;
            purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
            currentValue: import("@prisma/client-runtime-utils").Decimal | null;
            warrantyExpiry: Date | null;
            receiptIds: string[];
            imageUrl: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(tenantId: string, id: string): Promise<{
        model: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        purchaseDate: Date | null;
        status: string;
        shippingCost: import("@prisma/client-runtime-utils").Decimal | null;
        tax: import("@prisma/client-runtime-utils").Decimal | null;
        category: string | null;
        quantity: number;
        location: string | null;
        supplier: string | null;
        brand: string | null;
        assetTag: string | null;
        serialNumber: string | null;
        condition: string;
        assignedTo: string | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        currentValue: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        receiptIds: string[];
        imageUrl: string | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateInventoryAssetDto): Promise<{
        model: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        purchaseDate: Date | null;
        status: string;
        shippingCost: import("@prisma/client-runtime-utils").Decimal | null;
        tax: import("@prisma/client-runtime-utils").Decimal | null;
        category: string | null;
        quantity: number;
        location: string | null;
        supplier: string | null;
        brand: string | null;
        assetTag: string | null;
        serialNumber: string | null;
        condition: string;
        assignedTo: string | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        currentValue: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        receiptIds: string[];
        imageUrl: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
