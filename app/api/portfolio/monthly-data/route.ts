// app/api/portfolio/monthly-data/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchCryptoPrice, fetchEtfPrice, delay } from '@/lib/asset-config';

export async function GET() {
  try {
    const data = await prisma.monthlyPortfolio.findMany({
      orderBy: { month: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Normalizzazione data al 1° del mese UTC
    const tempDate = new Date(body.month);
    const monthDate = new Date(Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), 1, 0, 0, 0));

    // 1. Recupero Crypto in parallelo (CryptoCompare ha limiti alti)
    const [ethP, solP, linkP, opP] = await Promise.all([
      fetchCryptoPrice('eth', monthDate),
      fetchCryptoPrice('sol', monthDate),
      fetchCryptoPrice('link', monthDate),
      fetchCryptoPrice('op', monthDate),
    ]);

    // 2. Recupero ETF in sequenza con delay (AlphaVantage Free Limit: 5 per min)
    const mwrdP = await fetchEtfPrice('mwrd', monthDate);
    await delay(1500); // 1.5 secondi di pausa
    
    const smeaP = await fetchEtfPrice('smea', monthDate);
    await delay(1500); // 1.5 secondi di pausa
    
    const xmmeP = await fetchEtfPrice('xmme', monthDate);

    // Costruzione dell'oggetto dati per CREATE (include tutti i campi obbligatori)
    const createData = {
      month: monthDate,
      fixedIncome: Number(body.fixedIncome) || 0,
      variableIncome: Number(body.variableIncome) || 0,
      fixedExpenses: Number(body.fixedExpenses) || 0,
      variableExpenses: Number(body.variableExpenses) || 0,
      ing: Number(body.ing) || 0,
      bbva: Number(body.bbva) || 0,
      revolut: Number(body.revolut) || 0,
      directa: Number(body.directa) || 0,
      mwrd: Number(body.mwrd) || 0,   
      smea: Number(body.smea) || 0,
      xmme: Number(body.xmme) || 0,
      bond: Number(body.bond) || 0,
      eth: Number(body.eth) || 0,
      sol: Number(body.sol) || 0,
      link: Number(body.link) || 0,
      op: Number(body.op) || 0,
      usdt: Number(body.usdt) || 0,
      cometa: Number(body.cometa) || 0,
      mwrdPrice: mwrdP || 0,
      smeaPrice: smeaP || 0,
      xmmePrice: xmmeP || 0,
      ethPrice: ethP || 0,
      solPrice: solP || 0,
      linkPrice: linkP || 0,
      opPrice: opP || 0,
    };

    // Costruzione dell'oggetto dati per UPDATE (esclude campi auto-gestiti)
    const updateData = {
      fixedIncome: Number(body.fixedIncome) || 0,
      variableIncome: Number(body.variableIncome) || 0,
      fixedExpenses: Number(body.fixedExpenses) || 0,
      variableExpenses: Number(body.variableExpenses) || 0,
      ing: Number(body.ing) || 0,
      bbva: Number(body.bbva) || 0,
      revolut: Number(body.revolut) || 0,
      directa: Number(body.directa) || 0,
      mwrd: Number(body.mwrd) || 0,   
      smea: Number(body.smea) || 0,
      xmme: Number(body.xmme) || 0,
      bond: Number(body.bond) || 0,
      eth: Number(body.eth) || 0,
      sol: Number(body.sol) || 0,
      link: Number(body.link) || 0,
      op: Number(body.op) || 0,
      usdt: Number(body.usdt) || 0,
      cometa: Number(body.cometa) || 0,
      mwrdPrice: mwrdP || 0,
      smeaPrice: smeaP || 0,
      xmmePrice: xmmeP || 0,
      ethPrice: ethP || 0,
      solPrice: solP || 0,
      linkPrice: linkP || 0,
      opPrice: opP || 0,
    };

    const result = await prisma.monthlyPortfolio.upsert({    
      where: { month: monthDate },
      create: createData,
      update: updateData
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}