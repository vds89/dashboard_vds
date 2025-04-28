import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange'); // Retrieve the timeRange from the query
    const startDate = searchParams.get('start'); // Log the start date
    const endDate = searchParams.get('end'); // Log the end date

    console.log("Received start date:", startDate); // Log start date
    console.log("Received end date:", endDate); // Log end date

    // Get the current date
    const currentDate = new Date();

    let start: Date | null = null;

    // Set the start date based on the timeRange
    if (timeRange === 'full') {
      start = null; // Full data, no filtering
    } else if (timeRange === '1y') {
      // Last year
      start = new Date();
      start.setFullYear(currentDate.getFullYear() - 1);
    } else if (timeRange === '180d') {
      // Last 6 months
      start = new Date();
      start.setMonth(currentDate.getMonth() - 6);
    } else if (timeRange === 'custom' && startDate && endDate) {
      // For custom range, use the provided start and end dates
      start = new Date(startDate);
      const end = new Date(endDate);
      console.log("Dabase query start date:", startDate); // Log start date
      console.log("Dabase query  end date:", endDate); // Log end date
      const data = await prisma.vds_finance.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });
      return NextResponse.json({ data });
    }

    // Standard fetch by timeRange (excluding custom logic)
    const data = await prisma.vds_finance.findMany({
      where: start
        ? {
            date: {
              gte: start,
            },
          }
        : {}, // no filtering if start is null (full)
    });

    //console.log(`📦 DATABASE RESULTS for "${timeRange}" =`, JSON.stringify(data, null, 2));
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching total outcome:', error);
    return NextResponse.json({ error: 'Failed to fetch total outcome' }, { status: 500 });
  }
}