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
    
    // ✅ FIXED: Proper UTC date parsing for date-only fields
    // Input should be "YYYY-MM-DD" format from frontend
    const inputDate = body.month;
    
    // Parse as UTC date at midnight
    const tempDate = new Date(inputDate + 'T00:00:00.000Z');
    
    // Create normalized UTC date on the 1st of the month
    const monthDate = new Date(Date.UTC(
      tempDate.getUTCFullYear(), 
      tempDate.getUTCMonth(), 
      1, 
      0, 0, 0, 0
    ));

    console.log('📅 Processing date:', {
      received: inputDate,
      parsed: monthDate.toISOString(),
      dateOnly: monthDate.toISOString().split('T')[0]
    });

    // 2. Definizione della soglia temporale (1 Gennaio 2026)
    const cutoffDate = new Date(Date.UTC(2026, 0, 1));
    const shouldFetchPrices = monthDate >= cutoffDate;

    // Inizializziamo variabili per i prezzi
    let ethP, solP, linkP, opP, mwrdP, smeaP, xmmeP;

    // 3. Logica Condizionale: Fetch solo se siamo nel 2026 o oltre
    if (shouldFetchPrices) {
      console.log(`📅 Date ${monthDate.toISOString().split('T')[0]} is >= 2026. Fetching new prices...`);

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
      console.log(`📅 Date ${monthDate.toISOString().split('T')[0]} is historical (< 2026). Skipping fetch.`);
    }

    // 4. Preparazione Dati Base
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
    const priceData: Record<string, number> = {};

    if (shouldFetchPrices) {
      priceData.mwrdPrice = mwrdP || 0;
      priceData.smeaPrice = smeaP || 0;
      priceData.xmmePrice = xmmeP || 0;
      priceData.ethPrice = ethP || 0;
      priceData.solPrice = solP || 0;
      priceData.linkPrice = linkP || 0;
      priceData.opPrice = opP || 0;
    } else {
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

      update: {
        ...baseData,
        ...priceData 
      }
    });
    
    console.log('✅ Upsert successful:', result.month.toISOString().split('T')[0]);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error saving data:', error);
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

    console.log('🗑️ Received delete request for:', monthParam);

    // ✅ FIXED: Handle both ISO timestamp and date-only formats
    let normalizedDate: Date;
    
    try {
      // Remove any URL encoding artifacts and parse the date
      const cleanDateStr = decodeURIComponent(monthParam);
      
      // Extract just the date part (YYYY-MM-DD) regardless of format
      let dateOnly: string;
      
      if (cleanDateStr.includes('T')) {
        // It's an ISO timestamp: "2026-01-01T00:00:00.000Z"
        dateOnly = cleanDateStr.split('T')[0];
      } else if (cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // It's already date-only: "2026-01-01"
        dateOnly = cleanDateStr;
      } else {
        throw new Error('Invalid date format');
      }

      // Parse as UTC date at midnight on the 1st of the month
      const tempDate = new Date(dateOnly + 'T00:00:00.000Z');
      
      // Validate the date
      if (isNaN(tempDate.getTime())) {
        throw new Error('Invalid date value');
      }

      // Create normalized UTC date
      normalizedDate = new Date(Date.UTC(
        tempDate.getUTCFullYear(),
        tempDate.getUTCMonth(),
        1,
        0, 0, 0, 0
      ));

      console.log('✅ Parsed deletion date:', {
        original: monthParam,
        cleaned: cleanDateStr,
        dateOnly: dateOnly,
        normalized: normalizedDate.toISOString().split('T')[0]
      });

    } catch (parseError) {
      console.error('❌ Date parsing error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid date format', 
          details: parseError instanceof Error ? parseError.message : 'Could not parse date',
          received: monthParam
        }, 
        { status: 400 }
      );
    }

    // Perform the deletion
    await prisma.monthlyPortfolio.delete({
      where: { 
        month: normalizedDate 
      },
    });

    console.log('✅ Successfully deleted record for:', normalizedDate.toISOString().split('T')[0]);

    return NextResponse.json({ 
      success: true,
      deletedMonth: normalizedDate.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('❌ Error deleting data:', error);
    
    // Check if it's a "record not found" error
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { 
          error: 'Record not found',
          details: 'No portfolio entry exists for the specified month'
        }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to delete data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 