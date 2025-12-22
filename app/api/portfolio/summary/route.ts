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
};

// Definiamo un tipo per i totali delle categorie per aiutare TS
type CategoryTotals = Record<keyof typeof ASSET_MAPPING, number> & { total: number };

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
      const categoryTotals: any = {
        Liquidity: 0,
        Stock: 0,
        Bond: 0,
        'Fondo Pensione': 0,
        Crypto: 0
      };

      if (!data) return { ...categoryTotals, total: 0 };

      Object.entries(ASSET_MAPPING).forEach(([category, fields]) => {
        fields.forEach((field) => {
          const val = data[field as keyof MonthlyPortfolio];
          const numericVal = typeof val === 'number' ? val : 0;
          
          if (ASSET_PRICES[field]) {
            categoryTotals[category] += numericVal * ASSET_PRICES[field];
          } else {
            categoryTotals[category] += numericVal;
          }
        });
      });

      const totalGlobal = Object.values(categoryTotals).reduce((a: any, b: any) => a + b, 0);
      categoryTotals.total = totalGlobal;
      
      return categoryTotals as CategoryTotals;
    };

    const latestTotals = calculateTotals(latest);
    const prevTotals = calculateTotals(previous);

    const calculateTrend = (current: number, prev: number) => {
      if (!prev || prev === 0) return 0;
      return ((current - prev) / prev) * 100;
    };

    const summary = Object.keys(ASSET_MAPPING).map((catName) => {
      // Usiamo il casting per dire a TS che catName è una chiave valida di CategoryTotals
      const key = catName as keyof typeof ASSET_MAPPING;
      const currentVal = latestTotals[key] || 0;
      const prevVal = prevTotals[key] || 0;
      
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
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}