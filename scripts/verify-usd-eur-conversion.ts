// scripts/verify-usd-eur-conversion.ts
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

interface HistoricalPrice {
  date: string;
  symbol: string;
  price: number;
}

async function verifyConversion() {
  console.log('🔍 Verifying USD to EUR conversion...\n');

  // Load original USD prices
  const filePath = path.join(__dirname, '..', 'crypto_seeds_grouped_2015_2025.txt');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const usdPrices = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as HistoricalPrice[];

  // Create lookup map
  const usdPriceMap = new Map<string, number>();
  usdPrices.forEach(record => {
    const date = new Date(record.date);
    const key = `${date.toISOString().split('T')[0]}-${record.symbol.toUpperCase()}`;
    usdPriceMap.set(key, Number(record.price));
  });

  // Get recent records from database
  const dbRecords = await prisma.monthlyPortfolio.findMany({
    where: {
      month: {
        gte: new Date('2024-01-01')
      }
    },
    orderBy: { month: 'asc' }
  });

  console.log('📊 Comparison of Original USD vs Stored EUR prices:\n');
  console.log('Date       | Symbol | USD Price | EUR Price | Implied Rate');
  console.log('-----------|--------|-----------|-----------|-------------');

  dbRecords.forEach(record => {
    const dateKey = record.month.toISOString().split('T')[0];
    
    // Check each crypto
    const cryptos = [
      { symbol: 'ETH', usd: usdPriceMap.get(`${dateKey}-ETH`), eur: record.ethPrice },
      { symbol: 'SOL', usd: usdPriceMap.get(`${dateKey}-SOL`), eur: record.solPrice },
      { symbol: 'LINK', usd: usdPriceMap.get(`${dateKey}-LINK`), eur: record.linkPrice },
      { symbol: 'OP', usd: usdPriceMap.get(`${dateKey}-OP`), eur: record.opPrice },
    ];

    cryptos.forEach(({ symbol, usd, eur }) => {
      if (usd && eur && usd > 0 && eur > 0) {
        const impliedRate = eur / usd;
        console.log(
          `${dateKey} | ${symbol.padEnd(6)} | $${usd.toFixed(2).padStart(8)} | €${eur.toFixed(2).padStart(8)} | ${impliedRate.toFixed(4)}`
        );
      }
    });
  });

  // Calculate statistics
  const allRates: number[] = [];
  dbRecords.forEach(record => {
    const dateKey = record.month.toISOString().split('T')[0];
    const ethUsd = usdPriceMap.get(`${dateKey}-ETH`);
    if (ethUsd && record.ethPrice && ethUsd > 0 && record.ethPrice > 0) {
      allRates.push(record.ethPrice / ethUsd);
    }
  });

  if (allRates.length > 0) {
    const avgRate = allRates.reduce((a, b) => a + b, 0) / allRates.length;
    const minRate = Math.min(...allRates);
    const maxRate = Math.max(...allRates);

    console.log('\n📈 Exchange Rate Statistics:');
    console.log(`   Average Rate: ${avgRate.toFixed(4)}`);
    console.log(`   Min Rate: ${minRate.toFixed(4)}`);
    console.log(`   Max Rate: ${maxRate.toFixed(4)}`);
    console.log(`   Samples: ${allRates.length}`);
  }

  // Sample calculation
  console.log('\n💡 Example Calculation:');
  const sampleRecord = dbRecords[dbRecords.length - 1];
  if (sampleRecord) {
    const dateKey = sampleRecord.month.toISOString().split('T')[0];
    const ethUsd = usdPriceMap.get(`${dateKey}-ETH`);
    if (ethUsd && sampleRecord.ethPrice) {
      const holdings = sampleRecord.eth;
      const valueUsd = holdings * ethUsd;
      const valueEur = holdings * sampleRecord.ethPrice;
      
      console.log(`   Date: ${dateKey}`);
      console.log(`   ETH Holdings: ${holdings}`);
      console.log(`   ETH Price: $${ethUsd.toFixed(2)} (USD) → €${sampleRecord.ethPrice.toFixed(2)} (EUR)`);
      console.log(`   Portfolio Value: $${valueUsd.toFixed(2)} → €${valueEur.toFixed(2)}`);
    }
  }
}

verifyConversion()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });