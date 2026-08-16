"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedVehicleHierarchy = seedVehicleHierarchy;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
async function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const vehicleMap = new Map();
        fs.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (row) => {
            const year = parseInt(row.Year);
            const makeName = row.Make?.trim();
            const modelName = row.Model?.trim();
            const trimName = row.Trims?.trim();
            if (!year || !makeName || !modelName)
                return;
            if (!vehicleMap.has(year)) {
                vehicleMap.set(year, {
                    year,
                    makes: new Map(),
                });
            }
            const yearData = vehicleMap.get(year);
            if (!yearData.makes.has(makeName)) {
                yearData.makes.set(makeName, {
                    name: makeName,
                    models: new Map(),
                });
            }
            const makeData = yearData.makes.get(makeName);
            if (!makeData.models.has(modelName)) {
                makeData.models.set(modelName, {
                    name: modelName,
                    trims: new Set(),
                });
            }
            const modelData = makeData.models.get(modelName);
            if (trimName && trimName.length > 0) {
                modelData.trims.add(trimName);
            }
        })
            .on('end', () => {
            resolve(vehicleMap);
        })
            .on('error', (error) => {
            reject(error);
        });
    });
}
async function seedVehicleHierarchy(prisma) {
    console.log('🚗 Starting vehicle hierarchy seed...\n');
    const csvPath = path.join(__dirname, '../data/autos_data.csv');
    console.log('📖 Parsing CSV file...');
    const vehicleData = await parseCSV(csvPath);
    console.log(`✅ Parsed data for ${vehicleData.size} years\n`);
    let totalMakes = 0;
    let totalModels = 0;
    let totalTrims = 0;
    for (const [year, yearData] of vehicleData) {
        console.log(`📅 Processing year ${year}...`);
        const vehicleYear = await prisma.vehicleYear.findUnique({
            where: { year },
        });
        if (!vehicleYear) {
            console.log(`⚠️  Year ${year} not found in database, skipping...`);
            continue;
        }
        for (const [makeName, makeData] of yearData.makes) {
            const makeSlug = slugify(makeName);
            const vehicleMake = await prisma.vehicleMake.upsert({
                where: {
                    yearId_slug: {
                        yearId: vehicleYear.id,
                        slug: makeSlug,
                    },
                },
                update: {},
                create: {
                    yearId: vehicleYear.id,
                    name: makeName,
                    slug: makeSlug,
                    isActive: true,
                },
            });
            totalMakes++;
            for (const [modelName, modelData] of makeData.models) {
                const modelSlug = slugify(modelName);
                const vehicleModel = await prisma.vehicleModel.upsert({
                    where: {
                        makeId_slug: {
                            makeId: vehicleMake.id,
                            slug: modelSlug,
                        },
                    },
                    update: {},
                    create: {
                        makeId: vehicleMake.id,
                        name: modelName,
                        slug: modelSlug,
                        isActive: true,
                    },
                });
                totalModels++;
                for (const trimName of modelData.trims) {
                    const trimSlug = slugify(trimName);
                    await prisma.vehicleTrim.upsert({
                        where: {
                            modelId_slug: {
                                modelId: vehicleModel.id,
                                slug: trimSlug,
                            },
                        },
                        update: {},
                        create: {
                            modelId: vehicleModel.id,
                            name: trimName,
                            slug: trimSlug,
                            isActive: true,
                        },
                    });
                    totalTrims++;
                }
            }
        }
        console.log(`✅ Year ${year}: ${yearData.makes.size} makes processed`);
    }
    console.log('\n📊 Summary:');
    console.log(`  - Years processed: ${vehicleData.size}`);
    console.log(`  - Makes created/updated: ${totalMakes}`);
    console.log(`  - Models created/updated: ${totalModels}`);
    console.log(`  - Trims created/updated: ${totalTrims}`);
    console.log('\n✅ Vehicle hierarchy seed completed successfully!');
}
//# sourceMappingURL=vehicle-hierarchy.seed.js.map