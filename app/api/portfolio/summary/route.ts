// app/api/portfolio/summary/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get latest monthly data for current portfolio value calculation
    const latestData = await prisma.monthlyPortfolio.findFirst({
      orderBy: { month: 'desc' }
    });
    
    if (!latestData) {
      return NextResponse.json([]);
    }
    
    // Calculate total portfolio value from latest monthly data
    const liquidityTotal = latestData.ing + latestData.bbva + latestData.revolut + latestData.directa;
    const stockTotal = latestData.bond; // Bond is stored in EUR
    const cryptoTotal = latestData.usdt; // Using USDT as stable reference
    const fondoPensioneTotal = latestData.cometa;
    
    const totalPortfolioValue = liquidityTotal + stockTotal + cryptoTotal + fondoPensioneTotal;
    
    const summary = [
      {
        assetClass: 'Liquidity',
        totalQuantity: liquidityTotal,
        allocation: totalPortfolioValue > 0 ? (liquidityTotal / totalPortfolioValue) * 100 : 0
      },
      {
        assetClass: 'Stock',
        totalQuantity: stockTotal,
        allocation: totalPortfolioValue > 0 ? (stockTotal / totalPortfolioValue) * 100 : 0
      },
      {
        assetClass: 'Crypto',
        totalQuantity: cryptoTotal,
        allocation: totalPortfolioValue > 0 ? (cryptoTotal / totalPortfolioValue) * 100 : 0
      },
      {
        assetClass: 'Fondo Pensione',
        totalQuantity: fondoPensioneTotal,
        allocation: totalPortfolioValue > 0 ? (fondoPensioneTotal / totalPortfolioValue) * 100 : 0
      }
    ];
    
    return NextResponse.json({ summary, totalValue: totalPortfolioValue });
  } catch (error) {
    console.error('Error calculating portfolio summary:', error);
    return NextResponse.json({ error: 'Failed to calculate summary' }, { status: 500 });
  }
}