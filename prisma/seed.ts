// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

// Connessione al database
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Funzione helper per convertire stringhe in numeri
const num = (value?: string) => Number(value ?? 0);

// Interfaccia per le righe del CSV
interface MonthlyPortfolioCSV {
  month: string;
  fixedIncome?: string;
  variableIncome?: string;
  fixedExpenses?: string;
  variableExpenses?: string;
  ing?: string;
  bbva?: string;
  revolut?: string;
  directa?: string;
  mwrd?: string;
  smea?: string;
  xmme?: string;
  bond?: string;
  eth?: string;
  sol?: string;
  link?: string;
  op?: string;
  usdt?: string;
  cometa?: string;
  ethPrice?: string;
  solPrice?: string;
  linkPrice?: string;
  opPrice?: string;
  mwrdPrice?: string;
  smeaPrice?: string;
  xmmePrice?: string;
}

async function main() {
  console.log('🚀 Inizio seeding CSV...');

  const filePath = path.join(__dirname, 'MonthlyPortfolioData.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as MonthlyPortfolioCSV[];

  console.log(`📄 Records trovati: ${records.length}`);

  for (const record of records) {
    const monthDate = new Date(record.month);

    try {
      await prisma.monthlyPortfolio.upsert({
        where: { month: monthDate },
        update: {
          fixedIncome: num(record.fixedIncome),
          variableIncome: num(record.variableIncome),
          fixedExpenses: num(record.fixedExpenses),
          variableExpenses: num(record.variableExpenses),
          ing: num(record.ing),
          bbva: num(record.bbva),
          revolut: num(record.revolut),
          directa: num(record.directa),
          mwrd: num(record.mwrd),
          smea: num(record.smea),
          xmme: num(record.xmme),
          bond: num(record.bond),
          eth: num(record.eth),
          sol: num(record.sol),
          link: num(record.link),
          op: num(record.op),
          usdt: num(record.usdt),
          cometa: num(record.cometa),
          ethPrice: num(record.ethPrice),
          solPrice: num(record.solPrice),
          linkPrice: num(record.linkPrice),
          opPrice: num(record.opPrice),
          mwrdPrice: num(record.mwrdPrice),
          smeaPrice: num(record.smeaPrice),
          xmmePrice: num(record.xmmePrice),
        },
        create: {
          month: monthDate,
          fixedIncome: num(record.fixedIncome),
          variableIncome: num(record.variableIncome),
          fixedExpenses: num(record.fixedExpenses),
          variableExpenses: num(record.variableExpenses),
          ing: num(record.ing),
          bbva: num(record.bbva),
          revolut: num(record.revolut),
          directa: num(record.directa),
          mwrd: num(record.mwrd),
          smea: num(record.smea),
          xmme: num(record.xmme),
          bond: num(record.bond),
          eth: num(record.eth),
          sol: num(record.sol),
          link: num(record.link),
          op: num(record.op),
          usdt: num(record.usdt),
          cometa: num(record.cometa),
          ethPrice: num(record.ethPrice),
          solPrice: num(record.solPrice),
          linkPrice: num(record.linkPrice),
          opPrice: num(record.opPrice),
          mwrdPrice: num(record.mwrdPrice),
          smeaPrice: num(record.smeaPrice),
          xmmePrice: num(record.xmmePrice),
        },
      });

      console.log(`✅ Seed OK: ${record.month}`);
    } catch (error) {
      console.error(`❌ Errore mese ${record.month}`, error);
    }
  }

  console.log('🎉 Seeding CSV completato!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
