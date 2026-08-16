"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const title_mapping_service_1 = require("../title-mapping/title-mapping.service");
function titleCase(s) {
    return s.toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}
function csv(s) {
    return s
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
}
function titleTypeLabel(raw) {
    const u = raw.toUpperCase();
    if (u.includes('CLEAR') || u.includes('CLEAN'))
        return 'Clean Title';
    if (u.includes('SALVAGE'))
        return 'Salvage Title';
    if (u === 'CERTIFICATE OF TITLE')
        return 'Certificate of Title';
    if (u.includes('NONREPAIRABLE') || u.includes('NON-REPAIRABLE') || u.includes('NON REPAIRABLE'))
        return 'Non-Repairable';
    if (u.includes('JUNK'))
        return 'Junk';
    if (u.includes('REBUILT'))
        return 'Rebuilt';
    if (u === 'BILL OF SALE')
        return 'Bill of Sale';
    if (u.includes('PARTS ONLY'))
        return 'Parts Only';
    return titleCase(raw);
}
const STATE_MAP = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
    FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
    IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
    ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
    MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
    NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
    NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
    PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
    TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
    WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', ON: 'Ontario',
    PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan',
};
let CopartService = class CopartService {
    prisma;
    titleMapping;
    constructor(prisma, titleMapping) {
        this.prisma = prisma;
        this.titleMapping = titleMapping;
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, make, model, year, yearMin, yearMax, damageDescription, saleStatus, locationState, minPrice, maxPrice, minOdometer, maxOdometer, hasKeys, runsDrives, runsAndDrives, saleTitleType, titleCategory, sellerCategory, color, cylinders, drive, bodyStyle, fuelType, transmission, engineSizeMin, engineSizeMax, zip, radius, trim, saleDateFrom, saleDateTo, sortBy = 'createdAt', sortOrder = 'desc', ids, inspectableOnly, } = query;
        const skip = (page - 1) * limit;
        const idList = ids ? ids.split(',').filter((id) => id.trim()) : null;
        let geoBox = {};
        if (zip && radius && radius > 0) {
            const center = (0, common_2.geocodeZip)(zip);
            if (center) {
                const box = (0, common_2.boundingBox)(center, radius);
                geoBox = {
                    locationLat: { gte: box.minLat, lte: box.maxLat },
                    locationLng: { gte: box.minLon, lte: box.maxLon },
                };
            }
        }
        const titleOverrides = await this.titleMapping.getOverrides();
        let titleCategoryClause = {};
        if (titleCategory) {
            const cats = csv(titleCategory);
            const known = cats.filter((c) => c !== 'unknown');
            const wantUnknown = cats.includes('unknown');
            const or = [];
            if (known.length > 0) {
                const codes = (0, common_2.codesForTitleCategories)(known, titleOverrides);
                if (codes.length > 0)
                    or.push({ saleTitleType: { in: codes, mode: 'insensitive' } });
            }
            if (wantUnknown) {
                or.push({
                    NOT: { saleTitleType: { in: (0, common_2.allKnownCodes)(titleOverrides), mode: 'insensitive' } },
                });
            }
            if (or.length === 1)
                titleCategoryClause = or[0];
            else if (or.length > 1)
                titleCategoryClause = { OR: or };
        }
        const where = {
            AND: [
                idList && idList.length > 0 ? { lotNumber: { in: idList.map((id) => BigInt(id.trim())) } } : {},
                search
                    ? {
                        OR: [
                            { vin: { contains: search, mode: 'insensitive' } },
                            { make: { contains: search, mode: 'insensitive' } },
                            { modelGroup: { contains: search, mode: 'insensitive' } },
                            { modelDetail: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                make
                    ? make.includes(',')
                        ? { make: { in: csv(make) } }
                        : { make: { equals: make, mode: 'insensitive' } }
                    : {},
                model
                    ? model.includes(',')
                        ? { modelGroup: { in: csv(model) } }
                        : {
                            OR: [
                                { modelGroup: { contains: model, mode: 'insensitive' } },
                                { modelDetail: { contains: model, mode: 'insensitive' } },
                            ],
                        }
                    : {},
                year
                    ? { year }
                    : yearMin || yearMax
                        ? {
                            year: {
                                ...(yearMin && { gte: yearMin }),
                                ...(yearMax && { lte: yearMax }),
                            },
                        }
                        : {},
                damageDescription
                    ? damageDescription.includes(',')
                        ? { damageDescription: { in: csv(damageDescription) } }
                        : { damageDescription: { contains: damageDescription, mode: 'insensitive' } }
                    : {},
                saleStatus
                    ? saleStatus.includes(',')
                        ? { saleStatus: { in: csv(saleStatus) } }
                        : { saleStatus: { contains: saleStatus, mode: 'insensitive' } }
                    : {},
                locationState
                    ? locationState.includes(',')
                        ? { locationState: { in: csv(locationState) } }
                        : { locationState: { equals: locationState, mode: 'insensitive' } }
                    : {},
                minPrice || maxPrice
                    ? {
                        estRetailValue: {
                            ...(minPrice && { gte: minPrice }),
                            ...(maxPrice && { lte: maxPrice }),
                        },
                    }
                    : {},
                minOdometer || maxOdometer
                    ? {
                        odometer: {
                            ...(minOdometer && { gte: minOdometer }),
                            ...(maxOdometer && { lte: maxOdometer }),
                        },
                    }
                    : {},
                hasKeys ? { hasKeys } : {},
                runsDrives
                    ? { runsDrives: { contains: runsDrives, mode: 'insensitive' } }
                    : {},
                runsAndDrives === true
                    ? { runsDrives: { contains: 'drive', mode: 'insensitive' } }
                    : {},
                runsAndDrives === true
                    ? { NOT: { runsDrives: { contains: 'not', mode: 'insensitive' } } }
                    : {},
                saleTitleType
                    ? { saleTitleType: { equals: saleTitleType, mode: 'insensitive' } }
                    : {},
                titleCategoryClause,
                sellerCategory ? { sellerCategory: { in: csv(sellerCategory) } } : {},
                color ? { color: { in: csv(color), mode: 'insensitive' } } : {},
                cylinders ? { cylinders: { in: csv(cylinders) } } : {},
                drive ? { drive: { in: csv(drive), mode: 'insensitive' } } : {},
                bodyStyle ? { bodyStyle: { in: csv(bodyStyle), mode: 'insensitive' } } : {},
                fuelType ? { fuelType: { in: csv(fuelType), mode: 'insensitive' } } : {},
                transmission ? { transmission: { in: csv(transmission), mode: 'insensitive' } } : {},
                engineSizeMin || engineSizeMax
                    ? {
                        engineSizeL: {
                            ...(engineSizeMin && { gte: engineSizeMin }),
                            ...(engineSizeMax && { lte: engineSizeMax }),
                        },
                    }
                    : {},
                geoBox,
                trim
                    ? trim.includes(',')
                        ? { trim: { in: csv(trim) } }
                        : { trim: { equals: trim, mode: 'insensitive' } }
                    : {},
                saleDateFrom || saleDateTo
                    ? {
                        saleDate: {
                            ...(saleDateFrom && { gte: saleDateFrom }),
                            ...(saleDateTo && { lte: saleDateTo }),
                        },
                    }
                    : {},
                inspectableOnly === true
                    ? { yard: { is: { physicalInspectionAvailable: true } } }
                    : {},
            ],
        };
        const orderBy = {};
        const validSortFields = [
            'createdAt',
            'year',
            'make',
            'estRetailValue',
            'odometer',
            'saleDate',
            'highBid',
        ];
        if (validSortFields.includes(sortBy)) {
            orderBy[sortBy] = sortOrder;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [listings, total] = await Promise.all([
            this.prisma.auctionListing.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    yard: { select: { physicalInspectionAvailable: true } },
                },
            }),
            this.prisma.auctionListing.count({ where }),
        ]);
        const serializedListings = listings.map(({ yard, ...listing }) => ({
            ...listing,
            lotNumber: listing.lotNumber.toString(),
            inspectable: yard?.physicalInspectionAvailable ?? false,
        }));
        return {
            data: serializedListings,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id) {
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: BigInt(id) },
            include: { yard: { select: { physicalInspectionAvailable: true } } },
        });
        if (!listing) {
            return null;
        }
        const { yard, ...rest } = listing;
        return {
            ...rest,
            lotNumber: listing.lotNumber.toString(),
            inspectable: yard?.physicalInspectionAvailable ?? false,
        };
    }
    async findByLotNumber(lotNumber) {
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: BigInt(lotNumber) },
            include: { yard: { select: { physicalInspectionAvailable: true } } },
        });
        if (!listing) {
            return null;
        }
        const { yard, ...rest } = listing;
        return {
            ...rest,
            lotNumber: listing.lotNumber.toString(),
            inspectable: yard?.physicalInspectionAvailable ?? false,
        };
    }
    async getFilterOptions() {
        const [makes, damageTypes, saleStatuses, states, years, titleTypes] = await Promise.all([
            this.prisma.$queryRaw `
        SELECT DISTINCT make FROM auction_listings WHERE make IS NOT NULL ORDER BY make
      `,
            this.prisma.$queryRaw `
        SELECT DISTINCT "damageDescription" FROM auction_listings WHERE "damageDescription" IS NOT NULL ORDER BY "damageDescription"
      `,
            this.prisma.$queryRaw `
        SELECT DISTINCT "saleStatus" FROM auction_listings WHERE "saleStatus" IS NOT NULL ORDER BY "saleStatus"
      `,
            this.prisma.$queryRaw `
        SELECT DISTINCT "locationState" FROM auction_listings WHERE "locationState" IS NOT NULL ORDER BY "locationState"
      `,
            this.prisma.$queryRaw `
        SELECT DISTINCT year FROM auction_listings WHERE year IS NOT NULL ORDER BY year DESC
      `,
            this.prisma.$queryRaw `
        SELECT DISTINCT "saleTitleType" FROM auction_listings WHERE "saleTitleType" IS NOT NULL ORDER BY "saleTitleType"
      `,
        ]);
        return {
            makes: makes.map((m) => m.make),
            damageTypes: damageTypes.map((d) => d.damageDescription),
            saleStatuses: saleStatuses.map((s) => s.saleStatus),
            states: states.map((s) => s.locationState),
            years: years.map((y) => y.year),
            titleTypes: titleTypes.map((t) => t.saleTitleType),
        };
    }
    async getPortalFilters(opts) {
        const { year, make, model, trim } = opts;
        const yearClause = year ? { year } : undefined;
        const makeClause = make
            ? make.includes(',')
                ? { make: { in: csv(make) } }
                : { make: { equals: make, mode: 'insensitive' } }
            : undefined;
        const modelClause = model
            ? model.includes(',')
                ? { modelGroup: { in: csv(model) } }
                : { modelGroup: { equals: model, mode: 'insensitive' } }
            : undefined;
        const trimClause = trim
            ? trim.includes(',')
                ? { trim: { in: csv(trim) } }
                : { trim: { equals: trim, mode: 'insensitive' } }
            : undefined;
        const inspectable = {
            yard: { is: { physicalInspectionAvailable: true } },
        };
        const vehicleSel = {
            ...inspectable,
            ...(yearClause ?? {}),
            ...(makeClause ?? {}),
            ...(modelClause ?? {}),
            ...(trimClause ?? {}),
        };
        const [yearsRaw, makesRaw, modelsRaw, trimsRaw, damageRaw, statusRaw, titleRaw, stateRaw, keysRaw, sourceRaw, colorRaw, cylinderRaw, driveRaw, bodyRaw, fuelRaw, transRaw,] = await Promise.all([
            this.prisma.auctionListing.groupBy({
                by: ['year'],
                where: { ...inspectable, year: { not: null } },
                _count: { _all: true },
                orderBy: { year: 'desc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['make'],
                where: { ...inspectable, ...(yearClause ?? {}), make: { not: null } },
                _count: { _all: true },
                orderBy: { make: 'asc' },
            }),
            make
                ? this.prisma.auctionListing.groupBy({
                    by: ['modelGroup'],
                    where: {
                        ...inspectable,
                        ...(yearClause ?? {}),
                        ...(makeClause ?? {}),
                        modelGroup: { not: null },
                    },
                    _count: { _all: true },
                    orderBy: { modelGroup: 'asc' },
                })
                : Promise.resolve([]),
            make && model
                ? this.prisma.auctionListing.groupBy({
                    by: ['trim'],
                    where: {
                        ...inspectable,
                        ...(yearClause ?? {}),
                        ...(makeClause ?? {}),
                        ...(modelClause ?? {}),
                        trim: { not: null },
                    },
                    _count: { _all: true },
                    orderBy: { trim: 'asc' },
                })
                : Promise.resolve([]),
            this.prisma.auctionListing.groupBy({
                by: ['damageDescription'],
                where: { ...vehicleSel, damageDescription: { not: null } },
                _count: { _all: true },
                orderBy: { damageDescription: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['saleStatus'],
                where: { ...vehicleSel, saleStatus: { not: null } },
                _count: { _all: true },
                orderBy: { saleStatus: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['saleTitleType'],
                where: { ...vehicleSel, saleTitleType: { not: null } },
                _count: { _all: true },
                orderBy: { saleTitleType: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['locationState'],
                where: { ...vehicleSel, locationState: { not: null } },
                _count: { _all: true },
                orderBy: { locationState: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['hasKeys'],
                where: { ...vehicleSel, hasKeys: { not: null } },
                _count: { _all: true },
                orderBy: { hasKeys: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['sellerCategory'],
                where: { ...vehicleSel, sellerCategory: { not: null } },
                _count: { _all: true },
                orderBy: { sellerCategory: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['color'],
                where: { ...vehicleSel, color: { not: null } },
                _count: { _all: true },
                orderBy: { color: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['cylinders'],
                where: { ...vehicleSel, cylinders: { not: null } },
                _count: { _all: true },
                orderBy: { cylinders: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['drive'],
                where: { ...vehicleSel, drive: { not: null } },
                _count: { _all: true },
                orderBy: { drive: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['bodyStyle'],
                where: { ...vehicleSel, bodyStyle: { not: null } },
                _count: { _all: true },
                orderBy: { bodyStyle: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['fuelType'],
                where: { ...vehicleSel, fuelType: { not: null } },
                _count: { _all: true },
                orderBy: { fuelType: 'asc' },
            }),
            this.prisma.auctionListing.groupBy({
                by: ['transmission'],
                where: { ...vehicleSel, transmission: { not: null } },
                _count: { _all: true },
                orderBy: { transmission: 'asc' },
            }),
        ]);
        const years = yearsRaw
            .filter((r) => r.year !== null)
            .map((r) => ({
            value: r.year,
            label: String(r.year),
            count: r._count._all,
        }));
        const makes = makesRaw
            .filter((r) => r.make !== null && r.make !== '')
            .map((r) => ({
            value: r.make,
            label: titleCase(r.make),
            count: r._count._all,
        }));
        const models = modelsRaw
            .filter((r) => r.modelGroup !== null && r.modelGroup !== '')
            .map((r) => ({
            value: r.modelGroup,
            label: titleCase(r.modelGroup),
            count: r._count._all,
        }));
        const trims = trimsRaw
            .filter((r) => r.trim !== null && r.trim !== '')
            .map((r) => ({
            value: r.trim,
            label: titleCase(r.trim),
            count: r._count._all,
        }));
        const damageTypes = damageRaw
            .filter((r) => r.damageDescription !== null && r.damageDescription !== '')
            .map((r) => ({
            value: r.damageDescription,
            label: titleCase(r.damageDescription),
            count: r._count._all,
        }));
        const saleStatuses = statusRaw
            .filter((r) => r.saleStatus !== null && r.saleStatus !== '')
            .map((r) => ({
            value: r.saleStatus,
            label: titleCase(r.saleStatus),
            count: r._count._all,
        }));
        const titleTypes = titleRaw
            .filter((r) => r.saleTitleType !== null && r.saleTitleType !== '')
            .map((r) => ({
            value: r.saleTitleType,
            label: titleTypeLabel(r.saleTitleType),
            count: r._count._all,
        }));
        const states = stateRaw
            .filter((r) => {
            if (!r.locationState || r.locationState === '')
                return false;
            const key = r.locationState.trim().toUpperCase();
            return key in STATE_MAP;
        })
            .map((r) => {
            const key = r.locationState.trim().toUpperCase();
            return {
                value: key,
                label: STATE_MAP[key],
                count: r._count._all,
            };
        })
            .sort((a, b) => a.label.localeCompare(b.label));
        const keys = keysRaw
            .filter((r) => r.hasKeys !== null && r.hasKeys !== '')
            .map((r) => ({
            value: r.hasKeys,
            label: r.hasKeys,
            count: r._count._all,
        }));
        const titleOverrides = await this.titleMapping.getOverrides();
        const categoryCounts = {
            clean: 0,
            nonrepairable: 0,
            salvage: 0,
            unknown: 0,
        };
        for (const r of titleRaw) {
            if (!r.saleTitleType)
                continue;
            categoryCounts[(0, common_2.deriveTitleCategory)(r.saleTitleType, titleOverrides)] += r._count._all;
        }
        const titleCategories = common_2.TITLE_CATEGORIES.map((cat) => ({
            value: cat,
            label: common_2.TITLE_CATEGORY_LABELS[cat],
            count: categoryCounts[cat],
        })).filter((f) => f.count > 0);
        const mapSimpleFacet = (rows, key) => rows
            .filter((r) => r[key] !== null && r[key] !== '')
            .map((r) => ({
            value: String(r[key]),
            label: titleCase(String(r[key])),
            count: r._count._all,
        }));
        const sources = mapSimpleFacet(sourceRaw, 'sellerCategory')
            .map((f) => ({ ...f, label: f.value }));
        const colors = mapSimpleFacet(colorRaw, 'color');
        const cylinders = cylinderRaw
            .filter((r) => r.cylinders !== null && r.cylinders !== '')
            .map((r) => ({ value: r.cylinders, label: r.cylinders, count: r._count._all }));
        const drivetrains = mapSimpleFacet(driveRaw, 'drive');
        const bodyStyles = mapSimpleFacet(bodyRaw, 'bodyStyle');
        const fuelTypes = mapSimpleFacet(fuelRaw, 'fuelType');
        const transmissions = mapSimpleFacet(transRaw, 'transmission');
        return {
            years,
            makes,
            models,
            trims,
            damageTypes,
            saleStatuses,
            titleTypes,
            titleCategories,
            sources,
            colors,
            cylinders,
            drivetrains,
            bodyStyles,
            fuelTypes,
            transmissions,
            states,
            keys,
        };
    }
    async getStats() {
        const [total, byDamage, byState] = await Promise.all([
            this.prisma.auctionListing.count(),
            this.prisma.auctionListing.groupBy({
                by: ['damageDescription'],
                _count: true,
                orderBy: { _count: { damageDescription: 'desc' } },
                take: 10,
            }),
            this.prisma.auctionListing.groupBy({
                by: ['locationState'],
                _count: true,
                orderBy: { _count: { locationState: 'desc' } },
                take: 10,
            }),
        ]);
        return {
            total,
            byDamage,
            byState,
        };
    }
};
exports.CopartService = CopartService;
exports.CopartService = CopartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        title_mapping_service_1.TitleMappingService])
], CopartService);
//# sourceMappingURL=copart.service.js.map