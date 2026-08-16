import { PartsService } from './parts.service';
import { CreatePartDto, UpdatePartDto, QueryPartDto, CreatePartConditionDto, UpdatePartConditionDto, CreatePartStatusDto, UpdatePartStatusDto, CreatePartCategoryDto, UpdatePartCategoryDto } from './dto';
export declare class PartsController {
    private readonly partsService;
    constructor(partsService: PartsService);
    create(tenantId: string, createPartDto: CreatePartDto): Promise<{
        model: {
            name: string;
            id: string;
            slug: string;
        } | null;
        trim: {
            name: string;
            id: string;
            slug: string;
        } | null;
        status: {
            id: string;
            slug: string;
            title: string;
        };
        category: {
            id: string;
            slug: string;
            title: string;
        } | null;
        make: {
            name: string;
            id: string;
            slug: string;
        } | null;
        condition: {
            id: string;
            slug: string;
            title: string;
        };
        mainImage: {
            url: string;
            id: string;
            filename: string;
        } | null;
        year: {
            id: string;
            year: number;
        } | null;
        sourceVehicle: {
            id: string;
            vin: string;
            stockNumber: string | null;
        } | null;
    } & {
        length: import("@prisma/client-runtime-utils").Decimal | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        mainImageId: string | null;
        makeId: string | null;
        modelId: string | null;
        trimId: string | null;
        yearId: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        purchaseDate: Date | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        width: import("@prisma/client-runtime-utils").Decimal | null;
        height: import("@prisma/client-runtime-utils").Decimal | null;
        partNumber: string | null;
        sku: string | null;
        categoryId: string | null;
        conditionId: string;
        statusId: string;
        cost: import("@prisma/client-runtime-utils").Decimal | null;
        quantity: number;
        minQuantity: number;
        location: string | null;
        warehouseSection: string | null;
        sourceVin: string | null;
        sourceMiles: number | null;
        sourceVehicleId: string | null;
        weight: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyDays: number | null;
        warrantyNotes: string | null;
        supplier: string | null;
        supplierPartNumber: string | null;
        purchaseOrderNumber: string | null;
        brand: string | null;
        manufacturer: string | null;
        countryOfOrigin: string | null;
        isOem: boolean;
        isAftermarket: boolean;
        soldAt: Date | null;
        soldToId: string | null;
        soldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        soldDealId: string | null;
    }>;
    findAll(tenantId: string, query: QueryPartDto): Promise<{
        data: ({
            model: {
                name: string;
                id: string;
                slug: string;
            } | null;
            trim: {
                name: string;
                id: string;
                slug: string;
            } | null;
            status: {
                id: string;
                slug: string;
                title: string;
            };
            category: {
                id: string;
                slug: string;
                title: string;
            } | null;
            make: {
                name: string;
                id: string;
                slug: string;
            } | null;
            condition: {
                id: string;
                slug: string;
                title: string;
            };
            mainImage: {
                url: string;
                id: string;
                filename: string;
            } | null;
            year: {
                id: string;
                year: number;
            } | null;
            sourceVehicle: {
                id: string;
                vin: string;
                stockNumber: string | null;
            } | null;
        } & {
            length: import("@prisma/client-runtime-utils").Decimal | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            description: string | null;
            notes: string | null;
            mainImageId: string | null;
            makeId: string | null;
            modelId: string | null;
            trimId: string | null;
            yearId: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            purchaseDate: Date | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            width: import("@prisma/client-runtime-utils").Decimal | null;
            height: import("@prisma/client-runtime-utils").Decimal | null;
            partNumber: string | null;
            sku: string | null;
            categoryId: string | null;
            conditionId: string;
            statusId: string;
            cost: import("@prisma/client-runtime-utils").Decimal | null;
            quantity: number;
            minQuantity: number;
            location: string | null;
            warehouseSection: string | null;
            sourceVin: string | null;
            sourceMiles: number | null;
            sourceVehicleId: string | null;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
            warrantyDays: number | null;
            warrantyNotes: string | null;
            supplier: string | null;
            supplierPartNumber: string | null;
            purchaseOrderNumber: string | null;
            brand: string | null;
            manufacturer: string | null;
            countryOfOrigin: string | null;
            isOem: boolean;
            isAftermarket: boolean;
            soldAt: Date | null;
            soldToId: string | null;
            soldPrice: import("@prisma/client-runtime-utils").Decimal | null;
            soldDealId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getLowStock(tenantId: string): Promise<any>;
    backfillSkus(tenantId: string): Promise<{
        updated: number;
    }>;
    createCondition(tenantId: string, dto: CreatePartConditionDto): Promise<{
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
    }>;
    findAllConditions(tenantId: string): Promise<{
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
    }[]>;
    updateCondition(tenantId: string, id: string, dto: UpdatePartConditionDto): Promise<{
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
    }>;
    removeCondition(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    createStatus(tenantId: string, dto: CreatePartStatusDto): Promise<{
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
    }>;
    findAllStatuses(tenantId: string): Promise<{
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
    }[]>;
    updateStatus(tenantId: string, id: string, dto: UpdatePartStatusDto): Promise<{
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
    }>;
    removeStatus(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    createCategory(tenantId: string, dto: CreatePartCategoryDto): Promise<{
        parent: {
            id: string;
            slug: string;
            title: string;
        } | null;
        children: {
            id: string;
            slug: string;
            title: string;
        }[];
    } & {
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        description: string | null;
        parentId: string | null;
    }>;
    findAllCategories(tenantId: string): Promise<{
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        description: string | null;
        parentId: string | null;
    }[]>;
    updateCategory(tenantId: string, id: string, dto: UpdatePartCategoryDto): Promise<{
        parent: {
            id: string;
            slug: string;
            title: string;
        } | null;
        children: {
            id: string;
            slug: string;
            title: string;
        }[];
    } & {
        id: string;
        slug: string;
        title: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        description: string | null;
        parentId: string | null;
    }>;
    removeCategory(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        model: {
            name: string;
            id: string;
            slug: string;
        } | null;
        trim: {
            name: string;
            id: string;
            slug: string;
        } | null;
        status: {
            id: string;
            slug: string;
            title: string;
        };
        category: {
            id: string;
            slug: string;
            title: string;
        } | null;
        make: {
            name: string;
            id: string;
            slug: string;
        } | null;
        condition: {
            id: string;
            slug: string;
            title: string;
        };
        mainImage: {
            url: string;
            id: string;
            filename: string;
        } | null;
        year: {
            id: string;
            year: number;
        } | null;
        sourceVehicle: {
            id: string;
            vin: string;
            stockNumber: string | null;
        } | null;
    } & {
        length: import("@prisma/client-runtime-utils").Decimal | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        mainImageId: string | null;
        makeId: string | null;
        modelId: string | null;
        trimId: string | null;
        yearId: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        purchaseDate: Date | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        width: import("@prisma/client-runtime-utils").Decimal | null;
        height: import("@prisma/client-runtime-utils").Decimal | null;
        partNumber: string | null;
        sku: string | null;
        categoryId: string | null;
        conditionId: string;
        statusId: string;
        cost: import("@prisma/client-runtime-utils").Decimal | null;
        quantity: number;
        minQuantity: number;
        location: string | null;
        warehouseSection: string | null;
        sourceVin: string | null;
        sourceMiles: number | null;
        sourceVehicleId: string | null;
        weight: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyDays: number | null;
        warrantyNotes: string | null;
        supplier: string | null;
        supplierPartNumber: string | null;
        purchaseOrderNumber: string | null;
        brand: string | null;
        manufacturer: string | null;
        countryOfOrigin: string | null;
        isOem: boolean;
        isAftermarket: boolean;
        soldAt: Date | null;
        soldToId: string | null;
        soldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        soldDealId: string | null;
    }>;
    update(tenantId: string, id: string, updatePartDto: UpdatePartDto): Promise<{
        model: {
            name: string;
            id: string;
            slug: string;
        } | null;
        trim: {
            name: string;
            id: string;
            slug: string;
        } | null;
        status: {
            id: string;
            slug: string;
            title: string;
        };
        category: {
            id: string;
            slug: string;
            title: string;
        } | null;
        make: {
            name: string;
            id: string;
            slug: string;
        } | null;
        condition: {
            id: string;
            slug: string;
            title: string;
        };
        mainImage: {
            url: string;
            id: string;
            filename: string;
        } | null;
        year: {
            id: string;
            year: number;
        } | null;
        sourceVehicle: {
            id: string;
            vin: string;
            stockNumber: string | null;
        } | null;
    } & {
        length: import("@prisma/client-runtime-utils").Decimal | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        mainImageId: string | null;
        makeId: string | null;
        modelId: string | null;
        trimId: string | null;
        yearId: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        purchaseDate: Date | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        width: import("@prisma/client-runtime-utils").Decimal | null;
        height: import("@prisma/client-runtime-utils").Decimal | null;
        partNumber: string | null;
        sku: string | null;
        categoryId: string | null;
        conditionId: string;
        statusId: string;
        cost: import("@prisma/client-runtime-utils").Decimal | null;
        quantity: number;
        minQuantity: number;
        location: string | null;
        warehouseSection: string | null;
        sourceVin: string | null;
        sourceMiles: number | null;
        sourceVehicleId: string | null;
        weight: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyDays: number | null;
        warrantyNotes: string | null;
        supplier: string | null;
        supplierPartNumber: string | null;
        purchaseOrderNumber: string | null;
        brand: string | null;
        manufacturer: string | null;
        countryOfOrigin: string | null;
        isOem: boolean;
        isAftermarket: boolean;
        soldAt: Date | null;
        soldToId: string | null;
        soldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        soldDealId: string | null;
    }>;
    removeBulk(tenantId: string, body: {
        ids: string[];
    }): Promise<{
        message: string;
        count: number;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    adjustQuantity(tenantId: string, id: string, body: {
        adjustment: number;
        reason?: string;
    }): Promise<{
        model: {
            name: string;
            id: string;
            slug: string;
        } | null;
        trim: {
            name: string;
            id: string;
            slug: string;
        } | null;
        status: {
            id: string;
            slug: string;
            title: string;
        };
        category: {
            id: string;
            slug: string;
            title: string;
        } | null;
        make: {
            name: string;
            id: string;
            slug: string;
        } | null;
        condition: {
            id: string;
            slug: string;
            title: string;
        };
        mainImage: {
            url: string;
            id: string;
            filename: string;
        } | null;
        year: {
            id: string;
            year: number;
        } | null;
        sourceVehicle: {
            id: string;
            vin: string;
            stockNumber: string | null;
        } | null;
    } & {
        length: import("@prisma/client-runtime-utils").Decimal | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        mainImageId: string | null;
        makeId: string | null;
        modelId: string | null;
        trimId: string | null;
        yearId: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        purchaseDate: Date | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        width: import("@prisma/client-runtime-utils").Decimal | null;
        height: import("@prisma/client-runtime-utils").Decimal | null;
        partNumber: string | null;
        sku: string | null;
        categoryId: string | null;
        conditionId: string;
        statusId: string;
        cost: import("@prisma/client-runtime-utils").Decimal | null;
        quantity: number;
        minQuantity: number;
        location: string | null;
        warehouseSection: string | null;
        sourceVin: string | null;
        sourceMiles: number | null;
        sourceVehicleId: string | null;
        weight: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyDays: number | null;
        warrantyNotes: string | null;
        supplier: string | null;
        supplierPartNumber: string | null;
        purchaseOrderNumber: string | null;
        brand: string | null;
        manufacturer: string | null;
        countryOfOrigin: string | null;
        isOem: boolean;
        isAftermarket: boolean;
        soldAt: Date | null;
        soldToId: string | null;
        soldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        soldDealId: string | null;
    }>;
    markAsSold(tenantId: string, id: string, body: {
        soldToId?: string;
        soldPrice?: number;
        soldDealId?: string;
    }): Promise<{
        model: {
            name: string;
            id: string;
            slug: string;
        } | null;
        trim: {
            name: string;
            id: string;
            slug: string;
        } | null;
        status: {
            id: string;
            slug: string;
            title: string;
        };
        category: {
            id: string;
            slug: string;
            title: string;
        } | null;
        make: {
            name: string;
            id: string;
            slug: string;
        } | null;
        condition: {
            id: string;
            slug: string;
            title: string;
        };
        mainImage: {
            url: string;
            id: string;
            filename: string;
        } | null;
        year: {
            id: string;
            year: number;
        } | null;
        sourceVehicle: {
            id: string;
            vin: string;
            stockNumber: string | null;
        } | null;
    } & {
        length: import("@prisma/client-runtime-utils").Decimal | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        notes: string | null;
        mainImageId: string | null;
        makeId: string | null;
        modelId: string | null;
        trimId: string | null;
        yearId: string | null;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        purchaseDate: Date | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        width: import("@prisma/client-runtime-utils").Decimal | null;
        height: import("@prisma/client-runtime-utils").Decimal | null;
        partNumber: string | null;
        sku: string | null;
        categoryId: string | null;
        conditionId: string;
        statusId: string;
        cost: import("@prisma/client-runtime-utils").Decimal | null;
        quantity: number;
        minQuantity: number;
        location: string | null;
        warehouseSection: string | null;
        sourceVin: string | null;
        sourceMiles: number | null;
        sourceVehicleId: string | null;
        weight: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyDays: number | null;
        warrantyNotes: string | null;
        supplier: string | null;
        supplierPartNumber: string | null;
        purchaseOrderNumber: string | null;
        brand: string | null;
        manufacturer: string | null;
        countryOfOrigin: string | null;
        isOem: boolean;
        isAftermarket: boolean;
        soldAt: Date | null;
        soldToId: string | null;
        soldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        soldDealId: string | null;
    }>;
}
