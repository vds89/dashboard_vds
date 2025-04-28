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

function CustomToggleGroupItem({
  value,
  dateRange,
  setDateRange,
  setTimeRange,
}: {
  value: string;
  dateRange: { from: Date | null; to: Date | null }
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date | null; to: Date | null }>>
  setTimeRange: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToggleGroupItem
          value={value}
          onClick={() => {
            setTimeRange(value);
            setOpen((prev) => !prev);
          }}
        >
          Custom Period
        </ToggleGroupItem>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange.from ?? undefined}
          selected={{
            from: dateRange.from ?? undefined,
            to: dateRange.to ?? undefined,
          }}
          onSelect={(range) => {
            if (range) {
              setDateRange({ from: range.from ?? null, to: range.to ?? null });
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export const description = "An interactive area chart"

type FinanceEntry = {
  date: string;
  income: number;
  outcome: number;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--primary)",  
  },
  outcome: {
    label: "Outcome",
    color: "var(--chart-5)",
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
  const [chartData, setChartData] = React.useState<FinanceEntry[]>([]);
  const [dateRange, setDateRange] = React.useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile, setTimeRange]);

  React.useEffect(() => {
    async function loadData() {
      try {
        let url = `/api/finance/db-fetching?timeRange=${timeRange}`;
        if (timeRange === "custom" && dateRange.from && dateRange.to) {
          url += `&start=${dateRange.from.toISOString()}&end=${dateRange.to.toISOString()}`;
        }
        console.log("API Request URL:", url); // Log the API request URL with the custom date range

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
  }, [timeRange, dateRange]);

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
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="full">Complete Data</ToggleGroupItem>
            <ToggleGroupItem value="1y">Last Year</ToggleGroupItem>
            <ToggleGroupItem value="180d">Last 6 months</ToggleGroupItem>
            <CustomToggleGroupItem
              value="custom"
              dateRange={dateRange}
              setDateRange={setDateRange}
              setTimeRange={setTimeRange}
            />
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
                  stopColor="var(--color-income)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillOutcome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-outcome)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-outcome)"
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
              stroke="var(--color-income)"
              stackId="a"
            />
            <Area
              dataKey="outcome"
              type="natural"
              fill="url(#fillOutcome)"
              stroke="var(--color-outcome)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}