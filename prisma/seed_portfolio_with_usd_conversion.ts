// prisma/seed_portfolio_with_usd_conversion.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { getUsdToEurRate, convertUsdToEur, delay } from '../lib/usd-eur-converter';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const num = (value?: string) => Number(value ?? 0);

interface HistoricalPrice {
  date: string;
  symbol: string;
  price: number;
}

interface MonthlyPortfolioCSV {
  month: string;
  // ... (altri campi come prima)
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

/**
 * Helper per creare una data UTC pura ed evitare shift di fuso orario.
 */
function parseToUTCDate(dateStr: string): Date {
  // Se è formato ISO YYYY-MM-DD
  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  // Se è formato M/D/YYYY (tipico del CSV)
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(Date.UTC(year, month, day));
  }
  return new Date(dateStr);
}

// Parse historical crypto prices (in USD)
function parseHistoricalPrices(): Map<string, number> {
  const filePath = path.join(__dirname, '..', 'prisma/crypto_seeds_grouped_2015_2025.txt');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as HistoricalPrice[];

  const priceMap = new Map<string, number>();
  
  records.forEach(record => {
    const date = parseToUTCDate(record.date);
    // Usiamo getUTC per coerenza assoluta
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${record.symbol.toUpperCase()}`;
    priceMap.set(key, Number(record.price));
  });

  return priceMap;
}

// Get USD price using UTC key
function getHistoricalUsdPrice(
  priceMap: Map<string, number>, 
  date: Date, 
  symbol: string
): number {
  const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${symbol.toUpperCase()}`;
  return priceMap.get(key) || 0;
}

async function main() {
  console.log('🚀 Starting portfolio seeding with UTC protection...');

  const historicalPricesUsd = parseHistoricalPrices();
  console.log(`📊 Loaded ${historicalPricesUsd.size} historical USD price records`);

  const portfolioPath = path.join(__dirname, 'MonthlyPortfolioData.csv');
  const portfolioContent = fs.readFileSync(portfolioPath, 'utf-8');
  const records = parse(portfolioContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as MonthlyPortfolioCSV[];

  const exchangeRateCache = new Map<string, number>();

  for (const record of records) {
    // Usiamo il parser UTC per la data del mese del portfolio
    const monthDate = parseToUTCDate(record.month);
    const dateKey = monthDate.toISOString().split('T')[0];
    
    let exchangeRate = exchangeRateCache.get(dateKey);
    if (!exchangeRate) {
      console.log(`💱 Fetching USD/EUR rate for ${dateKey}...`);
      exchangeRate = await getUsdToEurRate(monthDate);
      exchangeRateCache.set(dateKey, exchangeRate);
      await delay(100);
    }

    // Lookup prezzi usando la logica UTC corretta
    const ethUsd = num(record.ethPrice) || getHistoricalUsdPrice(historicalPricesUsd, monthDate, 'ETH');
    const solUsd = num(record.solPrice) || getHistoricalUsdPrice(historicalPricesUsd, monthDate, 'SOL');
    const linkUsd = num(record.linkPrice) || getHistoricalUsdPrice(historicalPricesUsd, monthDate, 'LINK');
    const opUsd = num(record.opPrice) || getHistoricalUsdPrice(historicalPricesUsd, monthDate, 'OP');

    const ethEur = convertUsdToEur(ethUsd, exchangeRate);
    const solEur = convertUsdToEur(solUsd, exchangeRate);
    const linkEur = convertUsdToEur(linkUsd, exchangeRate);
    const opEur = convertUsdToEur(opUsd, exchangeRate);

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
          ethPrice: ethEur,
          solPrice: solEur,
          linkPrice: linkEur,
          opPrice: opEur,
          mwrdPrice: num(record.mwrdPrice),
          smeaPrice: num(record.smeaPrice),
          xmmePrice: num(record.xmmePrice),
        },
        create: {
          month: monthDate,
          // ... (stessi campi di update)
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
          ethPrice: ethEur,
          solPrice: solEur,
          linkPrice: linkEur,
          opPrice: opEur,
          mwrdPrice: num(record.mwrdPrice),
          smeaPrice: num(record.smeaPrice),
          xmmePrice: num(record.xmmePrice),
        },
      });

      console.log(`✅ ${dateKey} | ETH: $${ethUsd.toFixed(2)} → €${ethEur.toFixed(2)}`);
    } catch (error) {
      console.error(`❌ Error for month ${record.month}`, error);
    }
  }

  console.log(`\n🎉 Seeding completed!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });