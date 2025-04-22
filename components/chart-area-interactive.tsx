"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

type FinanceEntry = {
  date: string;
  income: number;
  outcome: number;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--color-Income)",
  },
  outcome: {
    label: "Outcome",
    color: "var(--color-Outcome)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  timeRange,
  setTimeRange,
}: {
  timeRange: string;
  setTimeRange: React.Dispatch<React.SetStateAction<string>>;
}) {
  const isMobile = useIsMobile();
  const [customStartDate] = React.useState<Date | null>(null);
  const [customEndDate] = React.useState<Date | null>(null);
  const [chartData, setChartData] = React.useState<FinanceEntry[]>([]);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile, setTimeRange]);

  React.useEffect(() => {
    async function loadData() {
      try {
        let url = `/api/finance/db-fetching?timeRange=${timeRange}`;
        if (timeRange === "custom" && customStartDate && customEndDate) {
          url += `&start=${customStartDate.toISOString()}&end=${customEndDate.toISOString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch outcome entries");
        const data = await response.json();

        setChartData(
          (data.data || []).map((item: FinanceEntry) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
            }),
          }))
        );
      } catch (error) {
        console.error("Error loading chart data:", error);
        setChartData([]);
      }
    }

    loadData();
  }, [timeRange, customStartDate, customEndDate]);

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Income VS Outcome</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Income and Outcome MoM view
          </span>
          <span className="@[540px]/card:hidden">Full Data</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="complete">Complete Data</ToggleGroupItem>
            <ToggleGroupItem value="1y">Last Year</ToggleGroupItem>
            <ToggleGroupItem value="180d">Last 6 months</ToggleGroupItem>
            <ToggleGroupItem value="custom">Custom Period</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Income)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillOutcome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Outcome)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Outcome)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="var(--color-Income)"
              stackId="a"
            />
            <Area
              dataKey="outcome"
              type="natural"
              fill="url(#fillOutcome)"
              stroke="var(--color-Outcome)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}