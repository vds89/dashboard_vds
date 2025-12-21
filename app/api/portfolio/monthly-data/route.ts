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
    
    // Ensure month is set to first day of the month
    const monthDate = new Date(body.month);
    monthDate.setDate(1);
    monthDate.setHours(0, 0, 0, 0);
    
    // Create or update monthly data
    const data = await prisma.monthlyPortfolio.upsert({
      where: { month: monthDate },
      create: {
        month: monthDate,
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
      },
      update: {
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
      }
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving monthly portfolio data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}