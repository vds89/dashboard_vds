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

const num = (value?: string): number => {
  if (!value || value.trim() === '' || value === 'NaN') return 0;
  return Number(value.replace(',', '.'));
};

/**
 * Gestisce i formati del tuo CSV: "1/1/2023" oppure "Jan 2023"
 */
function parseToNativeDate(dateStr: string): Date {
  let year: number, month: number;

  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    month = parseInt(parts[0], 10);
    year = parseInt(parts[2], 10);
  } else {
    const d = new Date(dateStr);
    month = d.getMonth() + 1;
    year = d.getFullYear();
  }
  return new Date(Date.UTC(year, month - 1, 1));
}

async function main() {
  console.log('🔄 Avvio sincronizzazione totale del database...');

  const portfolioPath = path.join(process.cwd(), 'prisma/vds_portfolio_2023_2025.csv');
  if (!fs.existsSync(portfolioPath)) {
    throw new Error(`❌ CSV non trovato in: ${portfolioPath}`);
  }

  const records = parse(fs.readFileSync(portfolioPath, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as MonthlyPortfolioCSV[];

  for (const record of records) {
    const monthDate = parseToNativeDate(record.month);
    
    // Prepariamo l'oggetto dati comune per evitare ripetizioni
    const dataPayload = {
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
      cometa: num(record.cometa),
      eth: num(record.eth),
      sol: num(record.sol),
      link: num(record.link),
      op: num(record.op),
      usdt: num(record.usdt),
      ethPrice: num(record.ethPrice),
      solPrice: num(record.solPrice),
      linkPrice: num(record.linkPrice),
      opPrice: num(record.opPrice),
      mwrdPrice: num(record.mwrdPrice),
      smeaPrice: num(record.smeaPrice),
      xmmePrice: num(record.xmmePrice),
    };

    try {
      await prisma.monthlyPortfolio.upsert({
        where: { month: monthDate },
        update: dataPayload, // Aggiorna TUTTI i campi se il mese esiste
        create: {
          month: monthDate,
          ...dataPayload,    // Inserisce TUTTI i campi se il mese è nuovo
        },
      });
      console.log(`✅ Sincronizzato: ${monthDate.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error(`❌ Errore mese ${record.month}:`, error);
    }
  }

  console.log('\n✨ Database perfettamente allineato al CSV.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });