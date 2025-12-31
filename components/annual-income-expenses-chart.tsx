// components/annual-income-expenses-chart.tsx

"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

interface AnnualMetric {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
}

const chartConfig = {
  totalIncome: {
    label: "Total Income",
    color: "var(--primary)",
  },
  totalExpenses: {
    label: "Total Expenses",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function AnnualIncomeExpensesChart() {
  const [data, setData] = useState<AnnualMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/portfolio/annual-metrics");
        const json = await response.json();
        setData(json.annualMetrics || []);
      } catch (error) {
        console.error("Error fetching annual metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Annual Income vs Expenses</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Annual Income vs Expenses</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">No annual data found</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average net savings
  const avgNetSavings = data.reduce((acc, d) => acc + d.netSavings, 0) / data.length;
  const latestYear = data[data.length - 1];
  const savingsGrowth = latestYear.netSavings > 0 ? "positive" : "negative";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annual Income vs Expenses</CardTitle>
        <CardDescription>
          Yearly comparison of total income and expenses from portfolio data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload) return null;
                const data = payload[0]?.payload;
                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={`Year ${data.year}`}
                    indicator="dashed"
                    formatter={(value, name) => {
                      const label = name === "totalIncome" ? "Income" : "Expenses";
                      return [
                        <>
                          <div className="text-xs text-muted-foreground">{label}</div>
                          <div className="font-medium">€{Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                          {name === "totalIncome" && data.netSavings !== undefined && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Net: €{data.netSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </div>
                          )}
                        </>,
                        ""
                      ];
                    }}
                  />
                );
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar 
              dataKey="totalIncome" 
              fill="var(--color-totalIncome)" 
              radius={4} 
            />
            <Bar 
              dataKey="totalExpenses" 
              fill="var(--color-totalExpenses)" 
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {savingsGrowth === "positive" ? "Positive" : "Negative"} net savings for {latestYear.year}
          <TrendingUp className={`h-4 w-4 ${savingsGrowth === "negative" ? "rotate-180" : ""}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Average annual net savings: €{avgNetSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </CardFooter>
    </Card>
  );
}