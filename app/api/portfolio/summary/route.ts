import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MonthlyPortfolio } from '@prisma/client';
import { ASSET_MAPPING, ASSET_PRICES, CategoryNames } from '@/lib/asset-config';

// Definiamo il tipo dei totali includendo il totale globale
type CategoryTotals = Record<CategoryNames, number> & { total: number };

interface AssetSummary {
  assetClass: string;
  totalQuantity: number;
  allocation: number;
  trend: number;
}

interface SummaryResponse {
  summary: AssetSummary[];
  totalValue: number;
  totalTrend: number;
  lastUpdated: Date | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all';
    
    let dateFilter = {};
    const now = new Date();
    
    if (range === '1y') {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      dateFilter = { gte: oneYearAgo };
    } else if (range === '6m') {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      dateFilter = { gte: sixMonthsAgo };
    } else if (range === '3m') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      dateFilter = { gte: threeMonthsAgo };
    }
    
    const monthlyData = await prisma.monthlyPortfolio.findMany({
      where: Object.keys(dateFilter).length > 0 ? { month: dateFilter } : {},
      orderBy: { month: 'desc' },
      take: range === 'all' ? 2 : undefined,
    });
    
    if (monthlyData.length === 0) {
      return NextResponse.json({ 
        summary: [], 
        totalValue: 0, 
        totalTrend: 0,
        lastUpdated: null
      } as SummaryResponse);
    }

    const latest = monthlyData[0];
    const previous = monthlyData.length > 1 ? monthlyData[1] : null;

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

      // FIX: Cast doppio per gestire il readonly di ASSET_MAPPING senza 'any'
      const entries = Object.entries(ASSET_MAPPING) as unknown as [CategoryNames, readonly string[]][];
      
      entries.forEach(([category, fields]) => {
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

      // Calcolo totale usando l'array di chiavi tipizzato
      const categories: CategoryNames[] = ['Liquidity', 'Stock', 'Bond', 'Fondo Pensione', 'Crypto'];
      categoryTotals.total = categories.reduce((acc, cat) => acc + categoryTotals[cat], 0);
      
      return categoryTotals;
    };

    const latestTotals = calculateTotals(latest);
    const prevTotals = calculateTotals(previous);

    const calculateTrend = (current: number, prev: number): number => {
      if (!prev || prev === 0) return 0; // Evita +100% fittizi al primo mese
      return ((current - prev) / prev) * 100;
    };

    const summary: AssetSummary[] = (Object.keys(ASSET_MAPPING) as CategoryNames[]).map((catName) => {
      const currentVal = latestTotals[catName];
      const prevVal = prevTotals[catName];
      
      return {
        assetClass: catName,
        totalQuantity: currentVal,
        allocation: latestTotals.total > 0 ? (currentVal / latestTotals.total) * 100 : 0,
        trend: calculateTrend(currentVal, prevVal)
      };
    });

    const response: SummaryResponse = { 
      summary, 
      totalValue: latestTotals.total,
      totalTrend: calculateTrend(latestTotals.total, prevTotals.total),
      lastUpdated: latest.month
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error calculating portfolio summary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}