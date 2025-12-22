// app/api/portfolio/monthly-data/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.monthlyPortfolio.findMany({
      orderBy: { month: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching monthly portfolio data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // --- FIX DATA ---
    // Creiamo una data basata sulla stringa ricevuta
    const tempDate = new Date(body.month);
    // Forziamo il primo giorno del mese alle 00:00:00 in formato UTC
    // Questo impedisce a Neon/Vercel di sottrarre ore e finire al giorno precedente
    const monthDate = new Date(Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), 1, 0, 0, 0));

    const result = await prisma.$transaction(async (tx) => {
      // Prepariamo i dati numerici per evitare ripetizioni (DRY)
      const numericData = {
        fixedIncome: body.fixedIncome || 0,
        variableIncome: body.variableIncome || 0,
        fixedExpenses: body.fixedExpenses || 0,
        variableExpenses: body.variableExpenses || 0,
        ing: body.ing || 0,
        bbva: body.bbva || 0,
        revolut: body.revolut || 0,
        directa: body.directa || 0,
        mwrd: body.mwrd || 0,   
        smea: body.smea || 0,
        xmme: body.xmme || 0,
        bond: body.bond || 0,
        eth: body.eth || 0,
        sol: body.sol || 0,
        link: body.link || 0,
        op: body.op || 0,
        usdt: body.usdt || 0,
        cometa: body.cometa || 0,
      };

      // 1. Upsert dei dati mensili
      const monthly = await tx.monthlyPortfolio.upsert({    
        where: { month: monthDate },
        create: {
          month: monthDate,
          ...numericData
        },
        update: {
          ...numericData
        }
      });
    
      // 2. AGGIORNAMENTO SUMMARY
      const latest = await tx.monthlyPortfolio.findFirst({ orderBy: { month: 'desc' } });
      
      if (latest && latest.month.getTime() === monthDate.getTime()) {
        // Calcolo Liquidity
        const liquiditySum = (body.ing || 0) + (body.bbva || 0) + (body.revolut || 0) + (body.directa || 0);
        
        await tx.portfolioAssetClass.upsert({
          where: { assetClass_ticker: { assetClass: 'Liquidity', ticker: 'TOTAL' } },
          update: { quantity: 1, valueEUR: liquiditySum },
          create: { assetClass: 'Liquidity', ticker: 'TOTAL', quantity: 1, valueEUR: liquiditySum }
        });

        // Esempio Crypto
        await tx.portfolioAssetClass.upsert({
          where: { assetClass_ticker: { assetClass: 'Crypto', ticker: 'USDT' } },
          update: { quantity: body.usdt || 0, valueEUR: body.usdt || 0 },
          create: { assetClass: 'Crypto', ticker: 'USDT', quantity: body.usdt || 0, valueEUR: body.usdt || 0 }
        });
      }

      return monthly;
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}