import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange'); // Retrieve the timeRange from the query

    // Get the current date
    const currentDate = new Date();

    let startDate: Date | null = null;

    // Set the start date based on the timeRange
    if (timeRange === 'full') {
      startDate = null; // Full data, no filtering
    } else if (timeRange === '1y') {
      // Last year
      startDate = new Date();
      startDate.setFullYear(currentDate.getFullYear() - 1);
    } else if (timeRange === '180d') {
      // Last 6 months
      startDate = new Date();
      startDate.setMonth(currentDate.getMonth() - 6);
    } else if (timeRange === 'custom') {
      // Handle custom date range if needed (implement custom logic)
      // Example: if customStartDate and customEndDate are provided, use them
      // This part would be handled based on the custom logic you implement
    }

    // Query the database, considering the timeRange
    const result = await prisma.vds_finance.aggregate({
      _sum: {
        outcome: true,
      },
      where: {
        date: startDate
          ? {
              gte: startDate, // Filter based on the start date
            }
          : undefined, // If no start date, fetch all data
      },
    });
    console.log(`TOTAL OUTCOME LAST ${timeRange} MONTHS = `, timeRange, result._sum.outcome);
    return NextResponse.json({ totalOutcome: result._sum.outcome || 0 });
  } catch (error) {
    console.error('Error fetching total outcome:', error);
    return NextResponse.json({ error: 'Failed to fetch total outcome' }, { status: 500 });
  }
}