import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';

/**
 * TEMPORARY demo-data seeder. Creates clearly-marked Buyer rows (email domain
 * `@htseed.local` + leadSource `SEED_DEMO`) so they can be bulk-deleted later
 * without touching real customers. NOT added to Clerk. Scoped to the caller's
 * tenant; reachable only through the staff-authenticated controller.
 */
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
const CITIES: Array<[string, string, string]> = [
  ['Houston', 'TX', '77002'], ['San Antonio', 'TX', '78205'], ['Dallas', 'TX', '75201'],
  ['Austin', 'TX', '78701'], ['Miami', 'FL', '33130'], ['Orlando', 'FL', '32801'],
  ['Atlanta', 'GA', '30303'], ['Phoenix', 'AZ', '85003'], ['Knoxville', 'TN', '37902'],
  ['Charlotte', 'NC', '28202'],
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedBuyers(tenantId: string, count = 65, daysBack = 60) {
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
      const dob = new Date(
        Date.UTC(1960 + Math.floor(Math.random() * 44), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 27)),
      );
      // Fictional 555-area phone, unique per row → satisfies @@unique([tenantId, phoneMain]).
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
      } catch (err) {
        this.logger.warn(`seed buyer ${i} failed: ${(err as Error).message}`);
      }
    }

    this.logger.log(`Seeded ${created}/${n} demo buyers into tenant ${tenantId}`);
    return { created, requested: n, tenantId, marker: SEED_MARKER, emailDomain: SEED_EMAIL_DOMAIN };
  }

  async deleteSeedBuyers(tenantId: string) {
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
}
