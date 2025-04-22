import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { NextRequest } from "next/server";
import { vds_finance } from "@prisma/client"; // Importing the type for the Prisma model

export async function GET() {
  
  const now = new Date(subMonths(new Date(2025,2,2), 1));
  
  // Adjusting start and end dates to ensure proper UTC conversion
  const currentStart = new Date(startOfMonth(now).setUTCHours(0, 0, 0, 0));  // Start of the current month (in UTC)
  const currentEnd = new Date(endOfMonth(now).setUTCHours(23, 59, 59, 999)); // End of the current month (in UTC)
  
  const previousStart = new Date(startOfMonth(subMonths(now, 1)).setUTCHours(0, 0, 0, 0));  // Start of the previous month (in UTC)
  const previousEnd = new Date(endOfMonth(subMonths(now, 1)).setUTCHours(23, 59, 59, 999)); // End of the previous month (in UTC)
  console.log("Current Start:", currentStart);
  console.log("Current End:", currentEnd);
  console.log("Previous Start:", previousStart);
  console.log("Previous End:", previousEnd);

  try {
    // Fetch current month data within the range
    const current = await prisma.vds_finance.findMany({
      where: {
        date: {
          gte: currentStart,
          lte: currentEnd,
        },
      },
    });

    // Fetch previous month data within the range
    const previous = await prisma.vds_finance.findMany({
      where: {
        date: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
    });

    // Aggregating results for current and previous month
    const currentIncome = current.reduce((sum, entry: vds_finance) => sum + entry.income, 0);
    const previousIncome = previous.reduce((sum, entry: vds_finance) => sum + entry.income, 0);
    const currentOutcome = current.reduce((sum, entry: vds_finance) => sum + entry.outcome, 0);
    const previousOutcome = previous.reduce((sum, entry: vds_finance) => sum + entry.outcome, 0);

    console.log("Current IN:", currentIncome);
    console.log("Current OUT:", currentOutcome);
    console.log("Previous IN:", previousIncome);
    console.log("Previous OUT:", previousOutcome);
    // Calculating percentage changes
    const incomeChange = calculateChange(previousIncome, currentIncome);
    const outcomeChange = calculateChange(previousOutcome, currentOutcome);
    console.log("Income Change:", incomeChange);
    console.log("Outcome Change:", outcomeChange);
    return Response.json({
      currentIncome,
      previousIncome,
      incomeChange,
      currentOutcome,
      previousOutcome,
      outcomeChange,
    });
  } catch (error) {
    console.error("Error in the monthly-comparison route:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

function calculateChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
