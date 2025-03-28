import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get the current date
    const today = new Date();

    // Calculate the start and end of the same month last year
    const startOfLastYearMonth = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const endOfLastYearMonth = new Date(today.getFullYear() - 1, today.getMonth() + 1, 0); // Last day of that month

    // Query the total income for the same month last year
    const result = await prisma.vds_finance.aggregate({
      _sum: {
        income: true,
      },
      where: {
        date: {
          gte: startOfLastYearMonth, // Start of last year's month
          lte: endOfLastYearMonth, // End of last year's month
        },
      },
    });
    console.log('LAST YEAR INCOMEs = ', result._sum.income)
    return NextResponse.json({ totalIncomeLastYearMonth: result._sum.income || 0 });
  } catch (error) {
    console.error('Error fetching last year income for the month:', error);
    return NextResponse.json({ error: 'Failed to fetch last year income for the month' }, { status: 500 });
  }
}
