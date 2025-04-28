import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const data = await prisma.vds_finance.findMany({
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;

  const monthlyData = data.map((entry) => {
    const year = entry.date.getFullYear();
    const month = entry.date.getMonth();
    const saving = entry.income - entry.outcome;
    const savingRate = entry.income > 0 ? (saving / entry.income) * 100 : 0;

    return {
      year,
      month,
      label: `${entry.date.toLocaleString("default", { month: "short" })} ${String(year).slice(-2)}`, // "Jan 24"
      income: Math.round(entry.income),
      outcome: Math.round(entry.outcome),
      saving: Math.round(saving),
      savingRate: +savingRate.toFixed(1),
    };
  });

  const lastYearData = monthlyData.filter((d) => d.year === lastYear);
  const currentYearData = monthlyData.filter((d) => d.year === currentYear);

  const groupedByYear = new Map<number, { income: number; outcome: number; savingRateSum: number; months: number }>();

  data.forEach((entry) => {
    const year = entry.date.getFullYear();
    const saving = entry.income - entry.outcome;
    const savingRate = entry.income > 0 ? (saving / entry.income) * 100 : 0;

    if (!groupedByYear.has(year)) {
      groupedByYear.set(year, { income: 0, outcome: 0, savingRateSum: 0, months: 0 });
    }
    const yearData = groupedByYear.get(year)!;
    yearData.income += entry.income;
    yearData.outcome += entry.outcome;
    yearData.savingRateSum += savingRate;
    yearData.months += 1;
  });

  const annualTrends = Array.from(groupedByYear.entries()).map(([year, value], idx, arr) => {
    const prev = arr[idx - 1];
    const incomeYoY = prev ? ((value.income - prev[1].income) / prev[1].income) * 100 : 0;
    const outcomeYoY = prev ? ((value.outcome - prev[1].outcome) / prev[1].outcome) * 100 : 0;
    const savingRate = value.income > 0 ? ((value.income - value.outcome) / value.income) * 100 : 0;

    return {
      year,
      income: Math.round(value.income),
      outcome: Math.round(value.outcome),
      savingRate: +savingRate.toFixed(1),
      incomeYoY: +incomeYoY.toFixed(1),
      outcomeYoY: +outcomeYoY.toFixed(1),
    };
  });

  const avgIncome = Math.round(monthlyData.reduce((acc, d) => acc + d.income, 0) / monthlyData.length);
  const avgOutcome = Math.round(monthlyData.reduce((acc, d) => acc + d.outcome, 0) / monthlyData.length);
  const avgSaving = Math.round(monthlyData.reduce((acc, d) => acc + d.saving, 0) / monthlyData.length);
  const avgSavingRate = monthlyData.reduce((acc, d) => acc + d.savingRate, 0) / monthlyData.length;

  return NextResponse.json({
    monthlyData,
    lastYearData,
    currentYearData,
    annualTrends,
    average: {
      income: avgIncome,
      outcome: avgOutcome,
      saving: avgSaving,
      savingRate: +avgSavingRate.toFixed(1),
    },
  });
}