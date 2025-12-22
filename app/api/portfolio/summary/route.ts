import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MonthlyPortfolio } from '@prisma/client';

// 1. Mappa delle categorie
const ASSET_MAPPING = {
  Liquidity: ['ing', 'bbva', 'revolut', 'directa'],
  Stock: ['mwrd', 'smea', 'xmme'],
  Bond: ['bond'],
  'Fondo Pensione': ['cometa'],
  Crypto: ['eth', 'sol', 'link', 'op', 'usdt']
} as const; // 'as const' rende le chiavi fisse e non semplici stringhe

// Definizione dei tipi basata sulla mappa sopra
type CategoryNames = keyof typeof ASSET_MAPPING;
type CategoryTotals = Record<CategoryNames, number> & { total: number };

// 2. Prezzi stimati
const ASSET_PRICES: Record<string, number> = {
  mwrd: 85.5,
  smea: 32.2,
  xmme: 40.1,
  eth: 2450.0,
  sol: 110.0,
  link: 14.5,
  op: 2.1,
  usdt: 1.0 
};

export async function GET() {
  try {
    const monthlyData = await prisma.monthlyPortfolio.findMany({
      orderBy: { month: 'desc' },
      take: 2
    });
    
    if (monthlyData.length === 0) {
      return NextResponse.json({ summary: [], totalValue: 0, totalTrend: 0 });
    }

    const latest = monthlyData[0];
    const previous = monthlyData[1];

  const calculateTotals = (data: MonthlyPortfolio | null | undefined): CategoryTotals => {
    const categoryTotals: CategoryTotals = {
      Liquidity: 0,
      Stock: 0,
      Bond: 0,
      'Fondo Pensione': 0,
      Crypto: 0,
      total: 0
    };

    if (!data) return categoryTotals;

    // 1. Convertiamo l'oggetto in unknown e poi nel tipo target per gestire il readonly e le chiavi
    const entries = Object.entries(ASSET_MAPPING) as unknown as [CategoryNames, readonly string[]][];

    entries.forEach(([category, fields]) => {
      fields.forEach((field) => {
        // Accesso sicuro alle proprietà del modello Prisma
        const val = data[field as keyof MonthlyPortfolio];
        const numericVal = typeof val === 'number' ? val : 0;
        
        if (ASSET_PRICES[field]) {
          categoryTotals[category] += numericVal * ASSET_PRICES[field];
        } else {
          categoryTotals[category] += numericVal;
        }
      });
    });

    // 2. Calcolo del totale (senza usare 'any')
    // Usiamo un array esplicito delle chiavi per evitare di sommare il campo 'total' stesso
    const categories: CategoryNames[] = ['Liquidity', 'Stock', 'Bond', 'Fondo Pensione', 'Crypto'];
    categoryTotals.total = categories.reduce((acc, cat) => acc + categoryTotals[cat], 0);
    
    return categoryTotals;
  };

    const latestTotals = calculateTotals(latest);
    const prevTotals = calculateTotals(previous);

    const calculateTrend = (current: number, prev: number) => {
      if (!prev || prev === 0) return 0;
      return ((current - prev) / prev) * 100;
    };

    const summary = (Object.keys(ASSET_MAPPING) as CategoryNames[]).map((catName) => {
      const currentVal = latestTotals[catName];
      const prevVal = prevTotals[catName];
      
      return {
        assetClass: catName,
        totalQuantity: currentVal,
        allocation: latestTotals.total > 0 ? (currentVal / latestTotals.total) * 100 : 0,
        trend: calculateTrend(currentVal, prevVal)
      };
    });

    return NextResponse.json({ 
      summary, 
      totalValue: latestTotals.total,
      totalTrend: calculateTrend(latestTotals.total, prevTotals.total)
    });

  } catch (error) {
    console.error('Error calculating summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}