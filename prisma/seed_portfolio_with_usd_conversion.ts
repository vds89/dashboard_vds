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

// Helper per pulire i numeri
const num = (value?: string | number) => {
  if (typeof value === 'number') return value;
  if (!value || value.trim() === '' || value === 'NaN') return 0;
  return Number(value.replace(',', '.'));
};

interface HistoricalPrice {
  date: string;
  symbol: string;
  price: string; // Il parser CSV legge inizialmente come stringa
}

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

/**
 * Normalizza qualsiasi stringa data al 1° del mese in UTC Puro
 */
function parseToNativeDate(dateStr: string): Date {
  let date: Date;
  // Gestisce "Jan 2023" o "2023-01-01"
  date = new Date(dateStr);
  // Se fallisce (es. formato 1/1/2023), proviamo split manuale
  if (isNaN(date.getTime()) && dateStr.includes('/')) {
    const parts = dateStr.split('/');
    date = new Date(Number(parts[2]), Number(parts[0]) - 1, 1);
  }
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
}

/**
 * Carica i prezzi storici USD dal file TXT/CSV
 */
function parseHistoricalPrices(): Map<string, number> {
  const filePath = path.join(process.cwd(), 'prisma/crypto_seeds_grouped_2015_2025.txt');
  if (!fs.existsSync(filePath)) return new Map();

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as HistoricalPrice[];

  const priceMap = new Map<string, number>();
  records.forEach(record => {
    const d = new Date(record.date);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${record.symbol.toUpperCase()}`;
    priceMap.set(key, num(record.price));
  });
  return priceMap;
}

function getHistoricalUsdPrice(priceMap: Map<string, number>, date: Date, symbol: string): number {
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${symbol.toUpperCase()}`;
  return priceMap.get(key) || 0;
}

async function main() {
  console.log('🚀 Avvio Seeding con conversione USD -> EUR e protezione UTC...');

  const historicalPricesUsd = parseHistoricalPrices();
  const portfolioPath = path.join(process.cwd(), 'prisma/vds_portfolio_2023_2025.csv');
  
  const records = parse(fs.readFileSync(portfolioPath, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as MonthlyPortfolioCSV[];

  const exchangeRateCache = new Map<string, number>();

  for (const record of records) {
    const monthDate = parseToNativeDate(record.month);
    const dateISO = monthDate.toISOString().split('T')[0];
    
    // 1. Gestione Tasso di Cambio con Cache
    let rate = exchangeRateCache.get(dateISO);
    if (!rate) {
      rate = await getUsdToEurRate(monthDate);
      exchangeRateCache.set(dateISO, rate);
      await delay(50); // Rispetto dei limiti API
    }

    // 2. Lookup Prezzi USD e conversione in EUR
    // Se il CSV ha già un prezzo lo usa, altrimenti pesca dal file storico
    const ethUsd = num(record.ethPrice) || getHistoricalUsdPrice(historicalPricesUsd, monthDate, 'ETH');
    const solUsd = num(record.solPrice) || getHistoricalUsdPrice(historicalPricesUsd, monthDate, 'SOL');
    const linkUsd = num(record.linkPrice) || getHistoricalUsdPrice(historicalPricesUsd, monthDate, 'LINK');
    const opUsd = num(record.opPrice) || getHistoricalUsdPrice(historicalPricesUsd, monthDate, 'OP');

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
      // Prezzi convertiti in EUR
      ethPrice: convertUsdToEur(ethUsd, rate),
      solPrice: convertUsdToEur(solUsd, rate),
      linkPrice: convertUsdToEur(linkUsd, rate),
      opPrice: convertUsdToEur(opUsd, rate),
      // ETF prezzi (già in EUR nel CSV)
      mwrdPrice: num(record.mwrdPrice),
      smeaPrice: num(record.smeaPrice),
      xmmePrice: num(record.xmmePrice),
    };

    try {
      await prisma.monthlyPortfolio.upsert({
        where: { month: monthDate },
        update: dataPayload,
        create: {
          month: monthDate,
          ...dataPayload,
        },
      });
      console.log(`✅ ${dateISO} | Cambio: ${rate.toFixed(4)} | ETH: €${dataPayload.ethPrice.toFixed(2)}`);
    } catch (error) {
      console.error(`❌ Errore record ${record.month}:`, error);
    }
  }

  console.log('\n🎉 Sincronizzazione completata!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });