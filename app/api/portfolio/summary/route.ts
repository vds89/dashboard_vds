import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Recuperiamo gli ultimi DUE mesi
    const monthlyData = await prisma.monthlyPortfolio.findMany({
      orderBy: { month: 'desc' },
      take: 2
    });
    
    if (monthlyData.length === 0) {
      return NextResponse.json({ summary: [], totalValue: 0 });
    }

    const latest = monthlyData[0];
    const previous = monthlyData[1]; // Potrebbe essere undefined se c'è solo un mese

    const calculateTotals = (data: any) => {
      if (!data) return { liquidity: 0, stock: 0, crypto: 0, pension: 0, total: 0 };
      
      const liquidity = data.ing + data.bbva + data.revolut + data.directa;
      // Usiamo prezzi placeholder o i campi bond (come visto prima)
      const stock = data.bond + (data.mwrd * 85) + (data.smea * 30) + (data.xmme * 40);
      const crypto = data.usdt + (data.eth * 2500) + (data.sol * 100) + (data.link * 15);
      const pension = data.cometa;
      const total = liquidity + stock + crypto + pension;
      
      return { liquidity, stock, crypto, pension, total };
    };

    const latestTotals = calculateTotals(latest);
    const prevTotals = calculateTotals(previous);

    const calculateTrend = (current: number, prev: number) => {
      if (!prev || prev === 0) return 0;
      return ((current - prev) / prev) * 100;
    };

    const assetClasses = [
      { name: 'Liquidity', current: latestTotals.liquidity, prev: prevTotals.liquidity },
      { name: 'Stock', current: latestTotals.stock, prev: prevTotals.stock },
      { name: 'Crypto', current: latestTotals.crypto, prev: prevTotals.crypto },
      { name: 'Fondo Pensione', current: latestTotals.pension, prev: prevTotals.pension },
    ];

    const summary = assetClasses.map(asset => ({
      assetClass: asset.name,
      totalQuantity: asset.current,
      allocation: latestTotals.total > 0 ? (asset.current / latestTotals.total) * 100 : 0,
      trend: calculateTrend(asset.current, asset.prev) // Aggiungiamo il trend
    }));

    return NextResponse.json({ 
      summary, 
      totalValue: latestTotals.total,
      totalTrend: calculateTrend(latestTotals.total, prevTotals.total)
    });
  } catch (error) {
    console.error('Error calculating summary:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}