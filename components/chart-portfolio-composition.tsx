"use client"

import * as React from "react"
import { Bar, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts"

import {
  Card,
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
  ChartLegendContent,
} from "@/components/ui/chart"

// --- CONFIGURAZIONE ---
const chartConfig = {
  netWorth: {
    label: "Net Worth",
    // Uso un colore Hex esplicito per evitare problemi di rendering SVG con le variabili CSS
    color: "#ff1493 ", 
  },
  liquidity: {
    label: "Liquidity",
    color: "#3b82f6", // Blue
  },
  stocks: {
    label: "Stocks",
    color: "#22c55e", // Green
  },
  bond: {
    label: "Bond",
    color: "#f97316", // Orange
  },
  pension: {
    label: "Pension Fund",
    color: "#a855f7", // Purple
  },
  crypto: {
    label: "Crypto",
    color: "#eab308", // Yellow
  },
} satisfies ChartConfig

// --- TIPI ---
interface RawPortfolioData {
  month: string;
  // Cash
  ing: number;
  bbva: number;
  revolut: number;
  directa: number;
  // Stocks
  mwrd: number; mwrdPrice: number;
  smea: number; smeaPrice: number;
  xmme: number; xmmePrice: number;
  // Other
  bond: number;
  cometa: number;
  // Crypto
  eth: number; ethPrice: number;
  sol: number; solPrice: number;
  link: number; linkPrice: number;
  op: number; opPrice: number;
  usdt: number;
}

interface PortfolioCompositionData {
  date: string;
  fullDate: string;
  liquidity: number;
  stocks: number;
  bond: number;
  pension: number;
  crypto: number;
  netWorth: number;
}

export function ChartPortfolioComposition() {
  const [chartData, setChartData] = React.useState<PortfolioCompositionData[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/portfolio/monthly-data')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const rawData: RawPortfolioData[] = await response.json()

        const cutoffDate = new Date('2023-01-01')
        
        const processed = rawData
          .map(entry => {
            const date = new Date(entry.month)
            return { ...entry, dateObj: date }
          })
          .filter(item => item.dateObj >= cutoffDate)
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
          .map(item => {
            const liquidity = (item.ing || 0) + (item.bbva || 0) + (item.revolut || 0) + (item.directa || 0)
            
            const stocks = 
              ((item.mwrd || 0) * (item.mwrdPrice || 0)) +
              ((item.smea || 0) * (item.smeaPrice || 0)) +
              ((item.xmme || 0) * (item.xmmePrice || 0))

            const bond = item.bond || 0
            const pension = item.cometa || 0

            const crypto = 
              ((item.eth || 0) * (item.ethPrice || 0)) +
              ((item.sol || 0) * (item.solPrice || 0)) +
              ((item.link || 0) * (item.linkPrice || 0)) +
              ((item.op || 0) * (item.opPrice || 0)) +
              (item.usdt || 0)

            const netWorth = liquidity + stocks + bond + pension + crypto

            return {
              date: item.dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
              fullDate: item.dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
              liquidity: Number(liquidity.toFixed(2)),
              stocks: Number(stocks.toFixed(2)),
              bond: Number(bond.toFixed(2)),
              pension: Number(pension.toFixed(2)),
              crypto: Number(crypto.toFixed(2)),
              netWorth: Number(netWorth.toFixed(2))
            }
          })

        setChartData(processed)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="h-[300px] w-full animate-pulse bg-muted/20 rounded-xl" />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Composition & Net Worth</CardTitle>
        <CardDescription>
          Monthly breakdown of assets (Bars) vs Total Net Worth (Line)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[400px]">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            />
            
            <ChartTooltip content={<ChartTooltipContent labelKey="fullDate" />} />
            <Legend content={<ChartLegendContent />} />

            {/* Bars (Stacked) */}
            <Bar dataKey="liquidity" stackId="a" fill="var(--color-liquidity)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="bond" stackId="a" fill="var(--color-bond)" />
            <Bar dataKey="pension" stackId="a" fill="var(--color-pension)" />
            <Bar dataKey="stocks" stackId="a" fill="var(--color-stocks)" />
            <Bar dataKey="crypto" stackId="a" fill="var(--color-crypto)" radius={[4, 4, 0, 0]} />

            {/* Line (Net Worth) */}
            <Line
              type="linear" // Changed to linear for cleaner connection
              dataKey="netWorth"
              stroke="var(--color-netWorth)" // Ora punta al colore Hex definito sopra
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--color-netWorth)", strokeWidth: 0 }} // Bullet
              activeDot={{ r: 6, strokeWidth: 0 }}
              connectNulls={true} // Assicura che la linea non si spezzi
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}