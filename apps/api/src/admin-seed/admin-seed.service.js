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
var AdminSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const SEED_EMAIL_DOMAIN = '@htseed.local';
const SEED_MARKER = 'SEED_DEMO';
const FIRST = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph',
    'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Nancy', 'Matthew',
    'Carlos', 'Maria', 'Jose', 'Ana', 'Luis', 'Sofia', 'Juan', 'Camila', 'Miguel',
    'Valentina', 'Diego', 'Lucia', 'Andres', 'Gabriela', 'Pedro', 'Isabella',
];
const LAST = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Torres',
];
const STREETS = [
    'Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Elm St',
    'Washington Ave', 'Lake Dr', 'Hill Rd', 'Park Blvd', 'Sunset Blvd', 'River Rd',
];
const CITIES = [
    ['Houston', 'TX', '77002'], ['San Antonio', 'TX', '78205'], ['Dallas', 'TX', '75201'],
    ['Austin', 'TX', '78701'], ['Miami', 'FL', '33130'], ['Orlando', 'FL', '32801'],
    ['Atlanta', 'GA', '30303'], ['Phoenix', 'AZ', '85003'], ['Knoxville', 'TN', '37902'],
    ['Charlotte', 'NC', '28202'],
];
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
let AdminSeedService = AdminSeedService_1 = class AdminSeedService {
    prisma;
    logger = new common_1.Logger(AdminSeedService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seedBuyers(tenantId, count = 65, daysBack = 60) {
        const n = Math.min(Math.max(count, 1), 500);
        const windowMs = daysBack * 24 * 60 * 60 * 1000;
        const now = Date.now();
        let created = 0;
        const stamp = now.toString(36);
        for (let i = 0; i < n; i++) {
            const first = pick(FIRST);
            const last = pick(LAST);
            const [city, state, zip] = pick(CITIES);
            const createdAt = new Date(now - Math.floor(Math.random() * windowMs));
            const dob = new Date(Date.UTC(1960 + Math.floor(Math.random() * 44), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 27)));
            const phoneMain = `555${String(2_000_000 + i).padStart(7, '0')}`;
            try {
                await this.prisma.buyer.create({
                    data: {
                        tenantId,
                        firstName: first,
                        lastName: last,
                        email: `seed.${stamp}.${i}@htseed.local`,
                        phoneMain,
                        phoneMobile: phoneMain,
                        dateOfBirth: dob,
                        currentAddress: `${100 + Math.floor(Math.random() * 9800)} ${pick(STREETS)}`,
                        currentCity: city,
                        currentState: state,
                        currentZipCode: zip,
                        currentCountry: 'USA',
                        leadSource: SEED_MARKER,
                        createdAt,
                    },
                });
                created++;
            }
            catch (err) {
                this.logger.warn(`seed buyer ${i} failed: ${err.message}`);
            }
        }
        this.logger.log(`Seeded ${created}/${n} demo buyers into tenant ${tenantId}`);
        return { created, requested: n, tenantId, marker: SEED_MARKER, emailDomain: SEED_EMAIL_DOMAIN };
    }
    async deleteSeedBuyers(tenantId) {
        const res = await this.prisma.buyer.deleteMany({
            where: {
                tenantId,
                OR: [
                    { email: { endsWith: SEED_EMAIL_DOMAIN } },
                    { leadSource: SEED_MARKER },
                ],
            },
        });
        this.logger.log(`Deleted ${res.count} demo buyers`);
        return { deleted: res.count };
    }
};
exports.AdminSeedService = AdminSeedService;
exports.AdminSeedService = AdminSeedService = AdminSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], AdminSeedService);
//# sourceMappingURL=admin-seed.service.js.map