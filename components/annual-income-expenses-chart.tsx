"use client";

import { useEffect, useState } from "react";
import { Bar, Line, ComposedChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AnnualMetric {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number; // Questo nel tuo codice API è il Saving Rate (0-1)
}

const chartConfig = {
  totalIncome: { label: "Income", color: "var(--primary)" },
  totalExpenses: { label: "Expenses", color: "var(--chart-5)" },
  netSavings: { label: "Saving Rate", color: "#10b981" }, // Verde smeraldo per la linea
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
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || data.length === 0) {
    return (
      <Card className="h-[250px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">
          {loading ? "Loading metrics..." : "No data available"}
        </div>
      </Card>
    );
  }

  const latest = data[data.length - 1];

  return (
    <Card className="overflow-hidden border-none shadow-none sm:border sm:shadow-sm">
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
        <div className="grid gap-1">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Financial Performance
          </CardTitle>
          <CardDescription className="text-2xl font-bold text-foreground">
            Income-Expenses-Saving Rate Overview
          </CardDescription>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-500">
            {(latest.netSavings * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] uppercase text-muted-foreground font-medium">{latest.year} Saving Rate</p>
        </div>
      </CardHeader>

      <CardContent className="p-2 pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
          <ComposedChart data={data} margin={{ top: 5, right: -10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              tickLine={false} 
              axisLine={false} 
              fontSize={11} 
              tickMargin={8}
            />
            {/* Asse Y Sinistro: Valuta */}
            <YAxis 
              yAxisId="left"
              tickLine={false} 
              axisLine={false} 
              fontSize={10} 
              tickFormatter={(v) => `€${v / 1000}k`} 
            />
            {/* Asse Y Destro: Percentuale (Invisibile per pulizia, ma serve per la scala) */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              display="none" 
              domain={[0, 1]} 
            />
            
            <ChartTooltip 
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={<ChartTooltipContent indicator="dot" />} 
            />
            
            <Bar 
              yAxisId="left"
              dataKey="totalIncome" 
              fill="var(--color-totalIncome)" 
              radius={[2, 2, 0, 0]} 
              barSize={30}
            />
            <Bar 
              yAxisId="left"
              dataKey="totalExpenses" 
              fill="var(--color-totalExpenses)" 
              radius={[2, 2, 0, 0]} 
              barSize={30}
            />
            
            {/* Linea del Saving Rate sovrapposta */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="netSavings"
              stroke="var(--color-netSavings)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--color-netSavings)", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
            
            <ChartLegend content={<ChartLegendContent className="text-[10px]" />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}