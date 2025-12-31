// app/api/portfolio/annual-metrics/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface AnnualMetric {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
}

export async function GET() {
  try {
    // Fetch all monthly portfolio data
    const monthlyData = await prisma.monthlyPortfolio.findMany({
      orderBy: { month: 'asc' }
    });

    if (monthlyData.length === 0) {
      return NextResponse.json({ annualMetrics: [] });
    }

    // Group by year and calculate totals
    const yearlyMap = new Map<number, AnnualMetric>();

    monthlyData.forEach((entry) => {
      const year = entry.month.getFullYear();
      
      // Calculate monthly income and expenses
      const monthlyIncome = entry.fixedIncome + entry.variableIncome;
      const monthlyExpenses = entry.fixedExpenses + entry.variableExpenses;

      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          totalIncome: 0,
          totalExpenses: 0,
          netSavings: 0
        });
      }

      const yearData = yearlyMap.get(year)!;
      yearData.totalIncome += monthlyIncome;
      yearData.totalExpenses += monthlyExpenses;
    });

    // Calculate net savings for each year
    const annualMetrics = Array.from(yearlyMap.values()).map(metric => ({
      ...metric,
      netSavings: metric.totalIncome - metric.totalExpenses
    }));

    return NextResponse.json({ annualMetrics });
  } catch (error) {
    console.error('Error fetching annual metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annual metrics' },
      { status: 500 }
    );
  }
}