import prisma from '@/lib/prisma'; // Ensure the path is correct
import { NextResponse } from 'next/server';

// Function to test database connection and fetch last year's income for the current month
async function testLastYearIncome() {
  try {
    // Get the current date
    const today = new Date();

    // Get the same month last year
    const startOfLastYearMonth = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const endOfLastYearMonth = new Date(today.getFullYear() - 1, today.getMonth() + 1, 0);

    // Fetch income records for that month
    const records = await prisma.vds_finance.findMany({
      where: {
        date: {
          gte: startOfLastYearMonth,
          lte: endOfLastYearMonth,
        },
      },
    });

    // Calculate the total income for that month
    const totalIncome = records.reduce((sum, record) => sum + record.income, 0);

    return {
      message: 'Database is reachable!',
      totalIncomeLastYearMonth: totalIncome,
      records,
    };
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw new Error('Database connection failed');
  }
}

// API GET Handler
export async function GET() {
  try {
    const response = await testLastYearIncome();
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to connect to the database' }, { status: 500 });
  }
}
