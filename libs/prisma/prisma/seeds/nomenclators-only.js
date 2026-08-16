"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const nomenclators_seed_1 = require("./nomenclators.seed");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Starting nomenclators seed...\n');
    try {
        await (0, nomenclators_seed_1.seedNomenclators)(prisma);
        console.log('\n🎉 Nomenclators seed completed successfully!');
    }
    catch (error) {
        console.error('\n❌ Error during seeding:', error);
        throw error;
    }
}
main()
    .catch((e) => {
    console.error('❌ Seed process failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=nomenclators-only.js.map