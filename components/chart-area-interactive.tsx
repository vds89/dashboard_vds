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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// --- Custom Components ---

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

// --- Configuration & Types ---

export const description = "An interactive area chart with 12-month Moving Average"

// Tipo per i dati grezzi dal DB (MonthlyPortfolio)
type RawPortfolioData = {
  month: string;
  fixedIncome: number;
  variableIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
}

// Tipo per i dati processati nel grafico
type FinanceEntry = {
  date: string;         // Stringa formattata per l'asse X
  rawDate: Date;        // Oggetto Date per filtri e ordinamento
  income: number;       // Valore (Moving Average)
  outcome: number;      // Valore (Moving Average)
}

const chartConfig = {
  income: {
    label: "Income (12m Avg)",
    color: "var(--primary)",
  },
  outcome: {
    label: "Outcome (12m Avg)",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

// --- Helper Functions ---

function calculateMovingAverage(data: { rawDate: Date; totalIncome: number; totalOutcome: number }[], windowSize: number): FinanceEntry[] {
  return data.map((entry, index, arr) => {
    // Calcolo della finestra per la media (prende fino a windowSize elementi indietro)
    const start = Math.max(0, index - windowSize + 1);
    const subset = arr.slice(start, index + 1);
    
    const sumIncome = subset.reduce((acc, curr) => acc + curr.totalIncome, 0);
    const sumOutcome = subset.reduce((acc, curr) => acc + curr.totalOutcome, 0);
    
    // Se siamo all'inizio della serie, facciamo la media sui dati disponibili
    const avgIncome = sumIncome / subset.length;
    const avgOutcome = sumOutcome / subset.length;

    return {
      date: entry.rawDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
      }),
      rawDate: entry.rawDate,
      income: Number(avgIncome.toFixed(2)),
      outcome: Number(avgOutcome.toFixed(2)),
    };
  });
}

// --- Main Component ---

export function ChartAreaInteractive({
  timeRange,
  setTimeRange,
}: {
  timeRange: string;
  setTimeRange: React.Dispatch<React.SetStateAction<string>>;
}) {
  const isMobile = useIsMobile();
  
  // fullChartData contiene tutti i dati con la Moving Average calcolata
  const [fullChartData, setFullChartData] = React.useState<FinanceEntry[]>([]);
  // filteredData è il sottoinsieme mostrato nel grafico in base al timeRange
  const [filteredData, setFilteredData] = React.useState<FinanceEntry[]>([]);
  
  const [dateRange, setDateRange] = React.useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  // Gestione responsive iniziale
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("1y"); // Default più sensato per mobile su una moving average
    }
  }, [isMobile, setTimeRange]);

  // 1. Fetching e Calcolo Moving Average (Eseguito una sola volta o al refresh della pagina)
  React.useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/portfolio/monthly-data');
        if (!response.ok) throw new Error("Failed to fetch portfolio data");
        const rawData: RawPortfolioData[] = await response.json();

        // Processamento iniziale:
        // 1. Converti stringhe in date e calcola i totali puntuali (Income vs Outcome)
        // 2. Ordina per data Crescente (necessario per la Moving Average)
        const processedSeries = rawData
          .map((entry) => {
            const dateObj = new Date(entry.month);
            return {
              rawDate: dateObj,
              totalIncome: (Number(entry.fixedIncome) || 0) + (Number(entry.variableIncome) || 0),
              totalOutcome: (Number(entry.fixedExpenses) || 0) + (Number(entry.variableExpenses) || 0),
            };
          })
          .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

        // 3. Calcola la Moving Average a 12 mesi su tutta la serie storica
        const maData = calculateMovingAverage(processedSeries, 12);
        
        setFullChartData(maData);
      } catch (error) {
        console.error("Error loading chart data:", error);
        setFullChartData([]);
      }
    }

    loadData();
  }, []);

  // 2. Filtraggio Locale in base al timeRange (Eseguito quando cambia timeRange, dateRange o i dati caricati)
  React.useEffect(() => {
    if (fullChartData.length === 0) {
      setFilteredData([]);
      return;
    }

    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (timeRange === "1y") {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    } else if (timeRange === "180d") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6);
    } else if (timeRange === "custom" && dateRange.from && dateRange.to) {
      startDate = dateRange.from;
      endDate = dateRange.to;
    } 
    // "full" implica nessun filtro start/end specifici (mostra tutto)

    const filtered = fullChartData.filter((item) => {
      if (startDate && item.rawDate < startDate) return false;
      if (endDate && item.rawDate > endDate) return false;
      return true;
    });

    setFilteredData(filtered);
  }, [timeRange, dateRange, fullChartData]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Income VS Outcome (12m Avg)</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            12-month Moving Average view
          </span>
          <span className="@[540px]/card:hidden">Moving Avg</span>
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
          <AreaChart data={filteredData}>
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
                // value è già formattato come "MMM YYYY" nel data processing,
                // ma se rechart passa la stringa completa, la gestiamo.
                const date = new Date(value);
                if (isNaN(date.getTime())) return value; // Ritorna la stringa se non è parsabile (es. già formattata)
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
                     // Gestione label tooltip
                     const date = new Date(value);
                     if (isNaN(date.getTime())) return value;
                    return date.toLocaleDateString("en-US", {
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