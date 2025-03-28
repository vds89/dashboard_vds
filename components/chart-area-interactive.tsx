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

const chartData = [
  { date: "2017-01-01", Income: 1841.4, Outcome: 1881.69 },
  { date: "2017-02-01", Income: 2792.0, Outcome: 1706.0 },
  { date: "2017-03-01", Income: 1923.0, Outcome: 1566.0 },
  { date: "2017-04-01", Income: 1907.55, Outcome: 1684.98 },
  { date: "2017-05-01", Income: 1961.4, Outcome: 1621.16 },
  { date: "2017-06-01", Income: 1900.0, Outcome: 2015.49 },
  { date: "2017-07-01", Income: 2126.0, Outcome: 1286.45 },
  { date: "2017-08-01", Income: 1793.0, Outcome: 2482.47 },
  { date: "2017-09-01", Income: 1752.0, Outcome: 2243.2 },
  { date: "2017-10-01", Income: 1957.0, Outcome: 1102.0 },
  { date: "2017-11-01", Income: 1983.0, Outcome: 1371.0 },
  { date: "2017-12-01", Income: 3323.0, Outcome: 815.54 },
  { date: "2018-01-01", Income: 2350.96, Outcome: 1253.3 },
  { date: "2018-02-01", Income: 2959.15, Outcome: 1802.0 },
  { date: "2018-03-01", Income: 1891.0, Outcome: 2025.87 },
  { date: "2018-04-01", Income: 2054.5, Outcome: 2333.12 },
  { date: "2018-05-01", Income: 1841.0, Outcome: 1632.0 },
  { date: "2018-06-01", Income: 1974.0, Outcome: 2326.65 },
  { date: "2018-07-01", Income: 2348.0, Outcome: 6656.0 },
  { date: "2018-08-01", Income: 1981.0, Outcome: 1737.0 },
  { date: "2018-09-01", Income: 1838.0, Outcome: 1089.0 },
  { date: "2018-10-01", Income: 1954.0, Outcome: 1946.0 },
  { date: "2018-11-01", Income: 2017.0, Outcome: 4076.0 },
  { date: "2018-12-01", Income: 3246.0, Outcome: 293.52 },
  { date: "2019-01-01", Income: 2063.18, Outcome: 1445.92 },
  { date: "2019-02-01", Income: 3253.0, Outcome: 1619.0 },
  { date: "2019-03-01", Income: 2509.0, Outcome: 1050.0 },
  { date: "2019-04-01", Income: 1974.0, Outcome: 790.0 },
  { date: "2019-05-01", Income: 1822.0, Outcome: 1220.5 },
  { date: "2019-06-01", Income: 1918.0, Outcome: 1875.0 },
  { date: "2019-07-01", Income: 2705.0, Outcome: 5946.0 },
  { date: "2019-08-01", Income: 4507.0, Outcome: 1795.0 },
  { date: "2019-09-01", Income: 2636.0, Outcome: 3880.0 },
  { date: "2019-10-01", Income: 2962.0, Outcome: 1338.0 },
  { date: "2019-11-01", Income: 2065.0, Outcome: 1633.0 },
  { date: "2019-12-01", Income: 3610.0, Outcome: 1575.0 },
  { date: "2020-01-01", Income: 1940.5, Outcome: 1760.0 },
  { date: "2020-02-01", Income: 3356.0, Outcome: 1802.0 },
  { date: "2020-03-01", Income: 1932.0, Outcome: 1062.2 },
  { date: "2020-04-01", Income: 2142.0, Outcome: 1362.0 },
  { date: "2020-05-01", Income: 1808.0, Outcome: 995.0 },
  { date: "2020-06-01", Income: 1848.0, Outcome: 1480.0 },
  { date: "2020-07-01", Income: 2212.0, Outcome: 2871.0 },
  { date: "2020-08-01", Income: 2508.5, Outcome: 8691.0 },
  { date: "2020-09-01", Income: 2107.0, Outcome: 1602.0 },
  { date: "2020-10-01", Income: 2099.0, Outcome: 1896.0 },
  { date: "2020-11-01", Income: 2263.0, Outcome: 1411.0 },
  { date: "2020-12-01", Income: 3976.0, Outcome: 1331.22 },
  { date: "2021-01-01", Income: 2226.0, Outcome: 1623.0 },
  { date: "2021-02-01", Income: 3602.0, Outcome: 1300.0 },
  { date: "2021-03-01", Income: 2992.0, Outcome: 1477.0 },
  { date: "2021-04-01", Income: 2242.0, Outcome: 1302.0 },
  { date: "2021-05-01", Income: 2193.0, Outcome: 1764.0 },
  { date: "2021-06-01", Income: 2164.0, Outcome: 1845.0 },
  { date: "2021-07-01", Income: 2185.0, Outcome: 2012.0 },
  { date: "2021-08-01", Income: 4778.0, Outcome: 2435.0 },
  { date: "2021-09-01", Income: 2550.0, Outcome: 2840.0 },
  { date: "2021-10-01", Income: 2287.0, Outcome: 1833.0 },
  { date: "2021-11-01", Income: 2388.0, Outcome: 1745.0 },
  { date: "2021-12-01", Income: 4056.0, Outcome: 2040.0 },
  { date: "2022-01-01", Income: 2312.0, Outcome: 1418.0 },
  { date: "2022-02-01", Income: 3833.0, Outcome: 1656.0 },
  { date: "2022-03-01", Income: 5297.0, Outcome: 5631.0 },
  { date: "2022-04-01", Income: 2710.0, Outcome: 1149.0 },
  { date: "2022-05-01", Income: 3135.0, Outcome: 4385.0 },
  { date: "2022-06-01", Income: 4309.0, Outcome: 2218.0 },
  { date: "2022-07-01", Income: 3015.0, Outcome: 2234.0 },
  { date: "2022-08-01", Income: 2717.0, Outcome: 2442.0 },
  { date: "2022-09-01", Income: 2629.0, Outcome: 1589.0 },
  { date: "2022-10-01", Income: 3002.0, Outcome: 1915.0 },
  { date: "2022-11-01", Income: 2970.0, Outcome: 1928.0 },
  { date: "2022-12-01", Income: 4792.0, Outcome: 2241.0 },
  { date: "2023-01-01", Income: 3219.0, Outcome: 2047.0 },
  { date: "2023-02-01", Income: 2836.0, Outcome: 2524.0 },
  { date: "2023-03-01", Income: 3257.0, Outcome: 2461.0 },
  { date: "2023-04-01", Income: 3406.0, Outcome: 3272.0 },
  { date: "2023-05-01", Income: 7274.0, Outcome: 1498.0 },
  { date: "2023-06-01", Income: 4670.0, Outcome: 1350.0 },
  { date: "2023-07-01", Income: 3947.0, Outcome: 2002.0 },
  { date: "2023-08-01", Income: 3203.0, Outcome: 3233.0 },
  { date: "2023-09-01", Income: 3442.0, Outcome: 1818.0 },
  { date: "2023-10-01", Income: 3386.0, Outcome: 1857.0 },
  { date: "2023-11-01", Income: 3488.0, Outcome: 2295.8 },
  { date: "2023-12-01", Income: 6638.0, Outcome: 1356.0 },
  { date: "2024-01-01", Income: 3678.17, Outcome: 1088.44 },
  { date: "2024-02-01", Income: 3083.34, Outcome: 918.0 },
  { date: "2024-03-01", Income: 3448.32, Outcome: 1050.0 },
  { date: "2024-04-01", Income: 2954.54, Outcome: 961.0 },
  { date: "2024-05-01", Income: 2947.0, Outcome: 842.0 },
  { date: "2024-06-01", Income: 3285.0, Outcome: 670.0 },
  { date: "2024-07-01", Income: 5997.0, Outcome: 1071.0 },
  { date: "2024-08-01", Income: 6644.0, Outcome: 1425.0 },
  { date: "2024-09-01", Income: 3665.0, Outcome: 950.0 },
  { date: "2024-10-01", Income: 0.0, Outcome: 820.0 },
  { date: "2024-11-01", Income: 209.0, Outcome: 709.0 },
  { date: "2024-12-01", Income: 4252.0, Outcome: 2782.0 },
  { date: "2025-01-01", Income: 2949.0, Outcome: 900.0 },
  { date: "2025-02-01", Income: 3690.0, Outcome: 875.0 },
]

const chartConfig = {
  Outcome: {
    label: "Income",
    color: "var(--primary)",
  },
  Income: {
    label: "Outcome",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ timeRange, setTimeRange }: { timeRange: string, setTimeRange: React.Dispatch<React.SetStateAction<string>> }) {
  const isMobile = useIsMobile();
  const [customStartDate] = React.useState(null);
  const [customEndDate] = React.useState(null);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile, setTimeRange]);

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange); // Update parent component's timeRange state
  };

  const filteredData = chartData.filter((item) => {
    const itemDate = new Date(item.date);
    const referenceDate = new Date("2025-02-01");

    let startDate = new Date(referenceDate);

    // Filter logic based on timeRange
    if (timeRange === "180d") {
      startDate.setMonth(startDate.getMonth() - 3);        // Last 3 months
    }  else if (timeRange === "1y") {
      startDate.setFullYear(startDate.getFullYear() - 1); // Last year
    } else if (timeRange === "complete") {
      startDate = new Date(0);                            // Full data set, no filtering
    } else if (timeRange === "custom") {
      // Custom period filtering
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return itemDate >= start && itemDate <= end;
      }
    }
    // For other ranges, compare dates
    return itemDate >= startDate;
  });

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
          <AreaChart data={filteredData}>
            <defs>
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
              dataKey="Outcome"
              type="natural"
              fill="url(#fillIncome)"
              stroke="var(--color-Income)"
              stackId="a"
            />
            <Area
              dataKey="Income"
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

