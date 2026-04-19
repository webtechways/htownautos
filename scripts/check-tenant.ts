import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      subdomain: true,
      postmarkDomainId: true,
      postmarkServerId: true,
      postmarkServerToken: true,
      postmarkWebhookId: true,
      deletedAt: true,
    },
  });
  console.log(JSON.stringify(tenants, null, 2));
  await prisma.$disconnect();
  await pool.end();
})();
