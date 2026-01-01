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
    const monthlyData = await prisma.monthlyPortfolio.findMany({
      orderBy: { month: 'asc' }
    });

    if (monthlyData.length === 0) {
      console.log("DEBUG: No monthly data found in database.");
      return NextResponse.json({ annualMetrics: [] });
    }

    const yearlyMap = new Map<number, AnnualMetric>();

    console.log("--- START DEBUG ANNUAL CALCULATION ---");

    monthlyData.forEach((entry) => {
      const year = entry.month.getFullYear();
      const monthlyIncome = entry.fixedIncome + entry.variableIncome;
      const monthlyExpenses = entry.fixedExpenses + entry.variableExpenses;

      // Log per singola riga del DB per verificare i dati grezzi
      console.log(`[Month: ${entry.month.toISOString().substring(0, 7)}] Inc: ${monthlyIncome} | Exp: ${monthlyExpenses}`);

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

    const annualMetrics = Array.from(yearlyMap.values()).map(metric => {
      const savingRate = metric.totalIncome > 0 
        ? (metric.totalIncome - metric.totalExpenses) / metric.totalIncome 
        : 0;

      // Log del totale annuale aggregato
      console.log(`>>> YEAR ${metric.year} TOTALS:`);
      console.log(`    Total Income:   ${metric.totalIncome}`);
      console.log(`    Total Expenses: ${metric.totalExpenses}`);
      console.log(`    Saving Rate:    ${(savingRate * 100).toFixed(2)}%`);

      return {
        ...metric,
        netSavings: savingRate
      };
    });

    console.log("--- END DEBUG ANNUAL CALCULATION ---");

    return NextResponse.json({ annualMetrics });
  } catch (error) {
    console.error('Error fetching annual metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annual metrics' },
      { status: 500 }
    );
  }
}