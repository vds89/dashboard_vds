// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Inizio seeding...');

  // Percorso del file JSON
  const filePath = path.join(__dirname, 'vds_finance.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const financeData = JSON.parse(rawData);

  console.log(`Pescati ${financeData.length} record da inserire.`);

  for (const item of financeData) {
    await prisma.vds_finance.upsert({
      where: { date: new Date(item.date) },
      update: {
        income: item.income,
        outcome: item.outcome,
      },
      create: {
        date: new Date(item.date),
        income: item.income,
        outcome: item.outcome,
      },
    });
  }

  console.log('✅ Seeding completato con successo!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });