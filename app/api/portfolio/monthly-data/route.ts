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
    
    // 1. Normalizzazione data al 1° del mese UTC
    const tempDate = new Date(body.month);
    const monthDate = new Date(Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), 1, 0, 0, 0));

    // 2. Definizione della soglia temporale (1 Gennaio 2026)
    const cutoffDate = new Date(Date.UTC(2026, 0, 1)); // Anno, Mese (0=Gen), Giorno
    const shouldFetchPrices = monthDate >= cutoffDate;

    // Inizializziamo variabili per i prezzi
    let ethP, solP, linkP, opP, mwrdP, smeaP, xmmeP;

    // 3. Logica Condizionale: Fetch solo se siamo nel 2026 o oltre
    if (shouldFetchPrices) {
      console.log(`📅 Date ${monthDate.toISOString()} is >= 2026. Fetching new prices...`);

      // Recupero Crypto in parallelo
      [ethP, solP, linkP, opP] = await Promise.all([
        fetchCryptoPrice('eth', monthDate),
        fetchCryptoPrice('sol', monthDate),
        fetchCryptoPrice('link', monthDate),
        fetchCryptoPrice('op', monthDate),
      ]);

      // Recupero ETF in sequenza con delay
      mwrdP = await fetchEtfPrice('mwrd', monthDate);
      await delay(1500);
      smeaP = await fetchEtfPrice('smea', monthDate);
      await delay(1500);
      xmmeP = await fetchEtfPrice('xmme', monthDate);
    } else {
      console.log(`📅 Date ${monthDate.toISOString()} is historical (< 2026). Skipping fetch.`);
      // Se non fetchiamo, lasciamo undefined. 
      // Se l'utente ha passato dei prezzi manuali nel body, potremmo usarli qui:
      // ethP = body.ethPrice; 
    }

    // 4. Preparazione Dati Base (Quantità e Valori Fissi)
    // Questi vengono sempre salvati/aggiornati
    const baseData = {
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
      cometa: Number(body.cometa) || 0,
      eth: Number(body.eth) || 0,
      sol: Number(body.sol) || 0,
      link: Number(body.link) || 0,
      op: Number(body.op) || 0,
      usdt: Number(body.usdt) || 0,
    };

    // 5. Preparazione Oggetto Prezzi
    // Creiamo un oggetto che contiene i prezzi SOLO se sono stati fetchati o passati
    const priceData: Record<string, number> = {};

    if (shouldFetchPrices) {
        // Se abbiamo fetchato, usiamo i nuovi valori (o 0 se la fetch ha fallito restituendo undefined/null)
        priceData.mwrdPrice = mwrdP || 0;
        priceData.smeaPrice = smeaP || 0;
        priceData.xmmePrice = xmmeP || 0;
        priceData.ethPrice = ethP || 0;
        priceData.solPrice = solP || 0;
        priceData.linkPrice = linkP || 0;
        priceData.opPrice = opP || 0;
    } else {
        // Se NON abbiamo fetchato (storico), controlliamo se l'utente ha passato prezzi manuali nel body
        // Altrimenti non aggiungiamo nulla a priceData, così l'UPDATE non sovrascrive i vecchi prezzi nel DB con 0.
        if (body.mwrdPrice !== undefined) priceData.mwrdPrice = Number(body.mwrdPrice);
        if (body.smeaPrice !== undefined) priceData.smeaPrice = Number(body.smeaPrice);
        if (body.xmmePrice !== undefined) priceData.xmmePrice = Number(body.xmmePrice);
        if (body.ethPrice !== undefined) priceData.ethPrice = Number(body.ethPrice);
        if (body.solPrice !== undefined) priceData.solPrice = Number(body.solPrice);
        if (body.linkPrice !== undefined) priceData.linkPrice = Number(body.linkPrice);
        if (body.opPrice !== undefined) priceData.opPrice = Number(body.opPrice);
    }

    // 6. Esecuzione Upsert
    const result = await prisma.monthlyPortfolio.upsert({    
      where: { month: monthDate },
      
      // CREATE: Se stiamo creando un NUOVO record, dobbiamo inserire tutto. 
      // Se siamo nel passato e non abbiamo prezzi, metteremo 0 (o quelli manuali).
      create: {
        ...baseData,
        mwrdPrice: priceData.mwrdPrice || 0,
        smeaPrice: priceData.smeaPrice || 0,
        xmmePrice: priceData.xmmePrice || 0,
        ethPrice: priceData.ethPrice || 0,
        solPrice: priceData.solPrice || 0,
        linkPrice: priceData.linkPrice || 0,
        opPrice: priceData.opPrice || 0,
      },

      // UPDATE: Aggiorniamo le quantità (baseData).
      // Aggiorniamo i prezzi SOLO se priceData contiene chiavi (cioè se abbiamo fetchato o inserito manualmente).
      // Se è un record storico e non abbiamo fetchato, i prezzi nel DB rimangono INVARIATI.
      update: {
        ...baseData,
        ...priceData 
      }
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');

    if (!monthParam) {
      return NextResponse.json({ error: 'Month parameter is required' }, { status: 400 });
    }

    const dateToDelete = new Date(monthParam);

    await prisma.monthlyPortfolio.delete({
      where: { 
        month: dateToDelete 
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}