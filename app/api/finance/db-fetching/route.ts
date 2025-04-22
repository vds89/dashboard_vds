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
      // Optional: you can add customStartDate/customEndDate params
      const customStart = searchParams.get('start');
      const customEnd = searchParams.get('end');
      if (customStart && customEnd) {
        startDate = new Date(customStart);
        const endDate = new Date(customEnd);

        const data = await prisma.vds_finance.findMany({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });
        return NextResponse.json({ data });
      }
    }

    // Standard fetch by timeRange (excluding custom logic)
    const data = await prisma.vds_finance.findMany({
        where: startDate
          ? {
              date: {
                gte: startDate,
              },
            }
          : {}, // no filtering if startDate is null (full)
      });
    console.log(`📦 DATABASE RESULTS for "${timeRange}" =`, JSON.stringify(data, null, 2));
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching total outcome:', error);
    return NextResponse.json({ error: 'Failed to fetch total outcome' }, { status: 500 });
  }
}