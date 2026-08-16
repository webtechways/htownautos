import { PrismaService } from '@htownautos/prisma';
import { Prisma } from '@prisma/client';
export interface CreateVehiclePartDto {
    partId: string;
    quantity?: number;
    priceAtTime?: number;
    notes?: string;
}
export interface CreatePartAndAssociateDto {
    name: string;
    partNumber?: string;
    sku?: string;
    description?: string;
    conditionId: string;
    statusId: string;
    categoryId?: string;
    cost?: number;
    price: number;
    quantity: number;
    quantityToUse: number;
    notes?: string;
}
export declare class VehiclePartsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByVehicle(vehicleId: string, tenantId: string): Promise<{
        data: ({
            part: {
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
            } & {
                length: Prisma.Decimal | null;
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
                metaValue: Prisma.JsonValue | null;
                purchaseDate: Date | null;
                price: Prisma.Decimal;
                width: Prisma.Decimal | null;
                height: Prisma.Decimal | null;
                partNumber: string | null;
                sku: string | null;
                categoryId: string | null;
                conditionId: string;
                statusId: string;
                cost: Prisma.Decimal | null;
                quantity: number;
                minQuantity: number;
                location: string | null;
                warehouseSection: string | null;
                sourceVin: string | null;
                sourceMiles: number | null;
                sourceVehicleId: string | null;
                weight: Prisma.Decimal | null;
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
                soldPrice: Prisma.Decimal | null;
                soldDealId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            vehicleId: string;
            partId: string;
            quantity: number;
            priceAtTime: Prisma.Decimal;
            installedAt: Date;
        })[];
        total: number;
        count: number;
    }>;
    associatePart(vehicleId: string, dto: CreateVehiclePartDto, tenantId: string): Promise<any>;
    createAndAssociate(vehicleId: string, dto: CreatePartAndAssociateDto, tenantId: string): Promise<any>;
    removeAssociation(vehicleId: string, vehiclePartId: string, tenantId: string, restoreStock?: boolean): Promise<{
        message: string;
    }>;
    updateAssociation(vehicleId: string, vehiclePartId: string, dto: {
        quantity?: number;
        priceAtTime?: number;
        notes?: string;
    }, tenantId: string): Promise<{
        part: {
            length: Prisma.Decimal | null;
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
            metaValue: Prisma.JsonValue | null;
            purchaseDate: Date | null;
            price: Prisma.Decimal;
            width: Prisma.Decimal | null;
            height: Prisma.Decimal | null;
            partNumber: string | null;
            sku: string | null;
            categoryId: string | null;
            conditionId: string;
            statusId: string;
            cost: Prisma.Decimal | null;
            quantity: number;
            minQuantity: number;
            location: string | null;
            warehouseSection: string | null;
            sourceVin: string | null;
            sourceMiles: number | null;
            sourceVehicleId: string | null;
            weight: Prisma.Decimal | null;
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
            soldPrice: Prisma.Decimal | null;
            soldDealId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        vehicleId: string;
        partId: string;
        quantity: number;
        priceAtTime: Prisma.Decimal;
        installedAt: Date;
    }>;
    getAvailableParts(tenantId: string, search?: string): Promise<({
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
    } & {
        length: Prisma.Decimal | null;
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
        metaValue: Prisma.JsonValue | null;
        purchaseDate: Date | null;
        price: Prisma.Decimal;
        width: Prisma.Decimal | null;
        height: Prisma.Decimal | null;
        partNumber: string | null;
        sku: string | null;
        categoryId: string | null;
        conditionId: string;
        statusId: string;
        cost: Prisma.Decimal | null;
        quantity: number;
        minQuantity: number;
        location: string | null;
        warehouseSection: string | null;
        sourceVin: string | null;
        sourceMiles: number | null;
        sourceVehicleId: string | null;
        weight: Prisma.Decimal | null;
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
        soldPrice: Prisma.Decimal | null;
        soldDealId: string | null;
    })[]>;
}
