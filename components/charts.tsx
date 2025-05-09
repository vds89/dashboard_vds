"use client";

import { useEffect, useState } from "react";
import {
    ComposedChart, 
    Line, 
    LabelList, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid,
    RadarChart,
    PolarAngleAxis, 
    PolarGrid, 
    Radar,
    BarChart,
} from "recharts";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend, 
    ChartLegendContent,
} from "@/components/ui/chart";

import { TrendingUp } from "lucide-react"

type MonthlyEntry = {
  date: string;
  income: number;
  outcome: number;
  saving: number;
  savingRate: number;
};

type AnnualEntry = {
  year: number;
  income: number;
  outcome: number;
  incomeYoY: number;
  outcomeYoY: number;
  savingRate: number;
};

const annualChartConfig = {
    annual: {
        label: "Annual Income vs Outcome",
      },

    income: {
      label: "Income",
      color: "var(--primary)",
    },
    outcome: {
      label: "Outcome",
      color: "var(--chart-5)",
    },
    savingRate: {
        label: "Saving Rate",
        color: "rgba(65, 62, 160, 0.5)",
      },    
  } satisfies ChartConfig

  const monthlyChartConfig = {
    month: {
        label: "Month",
      },

    income: {
      label: "Income",
      color: "var(--primary)",
    },
    outcome: {
      label: "Outcome",
      color: "var(--chart-5)",
    },   
  } satisfies ChartConfig

  const YoYchartConfig = {
    income: {
      label: "Income",
      color: "var(--primary)",
    },
    outcome: {
      label: "Outcome",
      color: "var(--chart-5)",
    },  
  } satisfies ChartConfig

export default function FinanceCharts() {
  const [annualData, setAnnualData] = useState<AnnualEntry[]>([]);
  const [lastYearData, setLastYearData] = useState<MonthlyEntry[]>([]);
  const [currentYearData, setCurrentYearData] = useState<MonthlyEntry[]>([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/finance/metrics");
      const json = await res.json();
      setAnnualData(json.annualTrends);
      setLastYearData(json.lastYearData); 
      setCurrentYearData(json.currentYearData);      
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 p-4">    
      {/* Chart 1 */}
      <Card>
            <CardHeader>
                <CardTitle>Annual Income vs Outcome + Saving Rate</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={annualChartConfig}>
                <ComposedChart
                    data={annualData}
                    margin={{ left: 12, right: 12 }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent labelKey="annual" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="income"
                    fill="var(--color-income)"
                    stroke="var(--color-income)"
                    >
                    <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                    />
                    </Line>
                    <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="outcome"
                    stroke="var(--color-outcome)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-outcome)" }}
                    activeDot={{ r: 6 }}
                    >
                    <LabelList
                        position="bottom"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                    />
                    </Line>
                    <Bar
                    yAxisId="right"
                    dataKey="savingRate"
                    barSize={20}
                    fill="rgba(65, 62, 160, 0.5)" // 50% transparent
                    >
                    <LabelList
                        position="bottom"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                    />
                    </Bar>
                </ComposedChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                    Saving, Income & Outcome Rates <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Showing annual income, outcome and saving rate comparison
                    </div>
                </div>
                </div>
            </CardFooter>
      </Card>

      {/* Chart 2 - Last Year Radar Chart */}
      <div className="flex flex-col gap-6 md:flex-row">
        <Card className="flex-1">
            <CardHeader className="items-center pb-4">
              <CardTitle>Radar Chart - Last Year</CardTitle>
              <CardDescription>
                Showing monthly Income & Outcome for last year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={monthlyChartConfig}
                className="mx-auto w-full aspect-square px-4"
              >
                <RadarChart
                  data={lastYearData}
                  margin={{ top: 20, bottom: 20, left: 40, right: 40 }}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <PolarGrid />
                  <Radar
                    dataKey="income"
                    fill="var(--color-income)"
                    fillOpacity={0.6}
                  />
                  <Radar
                    dataKey="outcome"
                    fill="var(--color-outcome)"
                    fillOpacity={0.4}
                  />
                  <ChartLegend className="mt-8" content={<ChartLegendContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
        </Card>

        {/* Chart 3 - Current Year Radar Chart */}
          <Card className="flex-1">
          <CardHeader className="items-center pb-4">
                <CardTitle>Radar Chart - Current Year</CardTitle>
                <CardDescription>
                  Showing monthly Income & Outcome for current year.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={monthlyChartConfig}
                  className="mx-auto w-full aspect-square px-4"
                >
                  <RadarChart
                    data={currentYearData}
                    margin={{ top: 20, bottom: 20, left: 40, right: 40 }}
                  >
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <PolarGrid />
                    <Radar
                      dataKey="income"
                      fill="var(--color-income)"
                      fillOpacity={0.6}
                    />
                    <Radar
                      dataKey="outcome"
                      fill="var(--color-outcome)"
                      fillOpacity={0.4}
                    />
                    <ChartLegend className="mt-8" content={<ChartLegendContent />} />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
          </Card>
        </div>

      {/* Chart 4 - YoY Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Bar Chart - Multiple</CardTitle>
          <CardDescription>YoY</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={YoYchartConfig}>
            <BarChart accessibilityLayer data={annualData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                axisLine={true}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  const year = payload?.[0]?.payload?.year;
                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      label={String(year)}
                      indicator="dashed"
                    />
                  );
                }}
              />
              <Bar dataKey="incomeYoY" fill="var(--color-income)" radius={4} />
              <Bar dataKey="outcomeYoY" fill="var(--color-outcome)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            YoY Income & Outcome change <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing YoY Income & Outcome change over the last years.
            Negative Outcome and Positive Income changes mean that we are improving YoY.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}