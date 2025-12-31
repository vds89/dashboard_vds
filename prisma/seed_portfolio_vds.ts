// prisma/seed_portfolio_vds.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const num = (value?: string) => Number(value ?? 0);

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

function parseToUTCDate(dateStr: string): Date {
  let year, month, day;
  if (dateStr.includes('-')) {
    [year, month, day] = dateStr.split('-').map(Number);
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/').map(Number);
    month = parts[0]; 
    day = parts[1];
    year = parts[2];
  } else {
    return new Date(dateStr);
  }
  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  console.log('🚀 Avvio aggiornamento selettivo prezzi ETF (MWRD, SMEA, XMME)...');

  const portfolioPath = path.join(__dirname, '..', 'prisma/vds_portfolio_2023_2025.csv');
  
  if (!fs.existsSync(portfolioPath)) {
    console.error(`❌ File non trovato: ${portfolioPath}`);
    return;
  }

  const portfolioContent = fs.readFileSync(portfolioPath, 'utf-8');
  const records = parse(portfolioContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as MonthlyPortfolioCSV[];

  for (const record of records) {
    const monthDate = parseToUTCDate(record.month);
    const dateDisplay = monthDate.toISOString().split('T')[0];

    try {
      await prisma.monthlyPortfolio.upsert({
        where: { month: monthDate },
        // AGGIORNA SOLO QUESTI 3 CAMPI SE IL RECORD ESISTE
        update: {
          mwrdPrice: num(record.mwrdPrice),
          smeaPrice: num(record.smeaPrice),
          xmmePrice: num(record.xmmePrice),
        },
        // CREA TUTTO IL RECORD SE NON ESISTE
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

      console.log(`✅ Prezzi ETF aggiornati per: ${dateDisplay}`);
    } catch (error) {
      console.error(`❌ Errore per il mese ${record.month}:`, error);
    }
  }

  console.log(`\n🎉 Aggiornamento prezzi completato!`);
}

main()
  .catch((e) => {
    console.error('❌ Errore fatale:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });