import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const recent = await prisma.emailMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      tenantId: true,
      direction: true,
      status: true,
      fromEmail: true,
      toEmail: true,
      subject: true,
      messageId: true,
      openCount: true,
      deliveredAt: true,
      lastOpenedAt: true,
      createdAt: true,
    },
  });
  console.log(`Recent EmailMessage rows (${recent.length}):\n`);
  for (const r of recent) {
    console.log(
      `  ${r.createdAt.toISOString()}  ${r.direction.padEnd(8)}  ${r.status.padEnd(10)}  ` +
      `"${r.subject}"  opens=${r.openCount}  ${r.fromEmail} -> ${r.toEmail}`,
    );
    console.log(`    messageId=${r.messageId || 'NULL'}`);
    console.log(`    delivered=${r.deliveredAt?.toISOString() || 'null'}  opened=${r.lastOpenedAt?.toISOString() || 'null'}`);
  }

  const unmatched = await prisma.unmatchedInboundEmail.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, fromEmail: true, toEmail: true, subject: true, status: true, createdAt: true },
  });
  console.log(`\nRecent UnmatchedInboundEmail rows (${unmatched.length}):\n`);
  for (const u of unmatched) {
    console.log(`  ${u.createdAt.toISOString()}  ${u.status}  "${u.subject}"  ${u.fromEmail} -> ${u.toEmail}`);
  }

  await prisma.$disconnect();
  await pool.end();
})();
