// components/section-cards.tsx

"use client"

import { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp } from "@tabler/icons-react"

interface AssetSummary {
  assetClass: string;
  totalQuantity: number;
  allocation: number;
}

interface SummaryResponse {
  summary: AssetSummary[];
  totalValue: number;
}

export function SectionCards({ timeRange }: { timeRange: string }) {
  const [assetSummary, setAssetSummary] = useState<AssetSummary[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetSummary();
  }, [timeRange]);

  const fetchAssetSummary = async () => {
    try {
      const response = await fetch('/api/portfolio/summary');
      const data: SummaryResponse = await response.json();
      setAssetSummary(data.summary || []);
      setTotalValue(data.totalValue || 0);
    } catch (error) {
      console.error('Error fetching asset summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getAssetClassColor = (assetClass: string) => {
    const colors: Record<string, string> = {
      'Liquidity': 'bg-blue-500',
      'Stock': 'bg-green-500',
      'Crypto': 'bg-purple-500',
      'Fondo Pensione': 'bg-orange-500',
      'Bond': 'bg-yellow-500'
    };
    return colors[assetClass] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-32 bg-gray-200 rounded mt-2"></div>
            </CardHeader>
            <CardFooter>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {assetSummary.map((asset) => (
        <Card key={asset.assetClass} className="@container/card hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardDescription>{asset.assetClass}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(asset.totalQuantity)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <div className={`h-3 w-3 rounded-full ${getAssetClassColor(asset.assetClass)} mr-2`}></div>
                {asset.allocation.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Portfolio Allocation
              <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {asset.allocation.toFixed(2)}% of total portfolio
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getAssetClassColor(asset.assetClass)} transition-all duration-500`}
                style={{ width: `${Math.min(asset.allocation, 100)}%` }}
              ></div>
            </div>
          </CardFooter>
        </Card>
      ))}
      
      {/* Total Portfolio Value Card */}
      <Card className="@container/card hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardDescription>Total Portfolio Value</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(totalValue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="mr-1" />
              100%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All Asset Classes Combined
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Sum of all portfolio assets
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}