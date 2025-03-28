import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get the current date
    const today = new Date();

    // Calculate the date 12 months ago from today
    const startOfLastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month

    // Query the total income for the last 12 months
    const result = await prisma.vds_finance.aggregate({
      _sum: {
        income: true,
      },
      where: {
        date: {
          gte: startOfLastYear, // Start of the 12-month period
          lte: endOfCurrentMonth, // End of the 12-month period
        },
      },
    });

    console.log('TOTAL INCOME LAST 12**** MONTHS = ', result._sum.income);

    return NextResponse.json({ lastYearIncome: result._sum.income || 0 });
  } catch (error) {
    console.error('Error fetching last 12 months income:', error);
    return NextResponse.json({ error: 'Failed to fetch last 12 months income' }, { status: 500 });
  }
}

