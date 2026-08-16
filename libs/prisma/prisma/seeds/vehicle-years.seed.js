"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedVehicleYears = seedVehicleYears;
async function seedVehicleYears(prisma) {
    console.log('📅 Seeding vehicle years...');
    const years = [];
    for (let year = 1900; year <= 2027; year++) {
        years.push({
            year,
            isActive: true,
        });
    }
    const batchSize = 50;
    let insertedCount = 0;
    for (let i = 0; i < years.length; i += batchSize) {
        const batch = years.slice(i, i + batchSize);
        const result = await prisma.vehicleYear.createMany({
            data: batch,
            skipDuplicates: true,
        });
        insertedCount += result.count;
        console.log(`✅ Processed years ${batch[0].year} to ${batch[batch.length - 1].year}`);
    }
    console.log(`✅ Successfully seeded ${insertedCount} vehicle years (1900-2027)`);
}
//# sourceMappingURL=vehicle-years.seed.js.map