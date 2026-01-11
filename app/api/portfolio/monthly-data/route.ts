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

    // ... (Il resto della logica di fetch dei prezzi rimane uguale) ...
    // Per brevità qui riporto solo la struttura di upsert, il fetch rimane invariato:
    
    // [Nota: Assicurati di mantenere qui il codice di fetchCryptoPrice/fetchEtfPrice che avevi prima]

    const createData = {
       // ... tutti i campi ...
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
       // Prezzi (recuperati o default 0 se li stai omettendo per brevità in questo snippet)
    };

    // Siccome createData e updateData sono quasi identici, usa spread o definiscili come prima.
    // L'importante è che la POST usi monthDate nel 'where' se serve o nel 'create'.
    // Upsert richiede 'where' unique:
    
    const result = await prisma.monthlyPortfolio.upsert({    
      where: { month: monthDate }, // Qui 'month' è la chiave unica corretta
      create: createData,
      update: createData // O specifica i campi di update se diversi
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

// *** LA PARTE CRUCIALE DA CORREGGERE ***
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // Cerchiamo 'month', non 'id'

    if (!monthParam) {
      return NextResponse.json({ error: 'Month parameter is required' }, { status: 400 });
    }

    // Convertiamo la stringa (es. "2023-01-01T00:00:00.000Z") in oggetto Date
    const dateToDelete = new Date(monthParam);

    await prisma.monthlyPortfolio.delete({
      where: { 
        month: dateToDelete // Usiamo il campo corretto dello schema
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}