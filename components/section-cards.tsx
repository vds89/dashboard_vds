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
import { cn } from "@/lib/utils"
// Aggiornati gli import: rimosso ASSET_PRICES, aggiunto formatPercentage se non presente
import { ASSET_CLASS_COLORS, formatCurrency } from "@/lib/asset-config"

// Helper locale per la percentuale (nel caso non fosse esportata dal config)
const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

interface AssetSummary {
  assetClass: string;
  totalQuantity: number;
  allocation: number;
  trend: number;
}

interface SummaryResponse {
  summary: AssetSummary[];
  totalValue: number;
  totalTrend: number;
  lastUpdated: string | null;
}

export function SectionCards({ timeRange }: { timeRange: string }) {
  const [assetSummary, setAssetSummary] = useState<AssetSummary[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [totalTrend, setTotalTrend] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssetSummary();
  }, [timeRange]);

  const fetchAssetSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let rangeParam = 'all';
      if (timeRange === '1y') rangeParam = '1y';
      else if (timeRange === '180d') rangeParam = '6m';
      else if (timeRange === 'full') rangeParam = 'all';
      
      const response = await fetch(`/api/portfolio/summary?range=${rangeParam}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: SummaryResponse = await response.json();
      
      setAssetSummary(data.summary || []);
      setTotalValue(data.totalValue || 0);
      setTotalTrend(data.totalTrend || 0);
      setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : null);
    } catch (error) {
      console.error('Error fetching asset summary:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getAssetClassColor = (assetClass: string) => {
    // Gestione sicura del mapping dei colori
    const colors = ASSET_CLASS_COLORS as Record<string, string>;
    return colors[assetClass] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse bg-muted/50 h-[160px]">
            <CardHeader className="space-y-2">
              <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
              <div className="h-8 w-32 bg-muted-foreground/20 rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <div className="p-10 text-center border-2 border-dashed rounded-xl bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800">
          <p className="text-red-700 dark:text-red-400 font-medium">Error loading portfolio data</p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-2">{error}</p>
          <button 
            onClick={fetchAssetSummary}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 xl:grid-cols-3">
      
      {assetSummary.map((asset) => (
        <Card key={asset.assetClass} className="hover:shadow-md transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", getAssetClassColor(asset.assetClass))} />
              {asset.assetClass}
            </CardDescription>
            <CardTitle className="text-xl font-bold tabular-nums">
              {formatCurrency(asset.totalQuantity)}
            </CardTitle>
            <CardAction>
              <div className="flex flex-col items-end">
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                  {asset.allocation.toFixed(1)}%
                </Badge>
                <span className={cn(
                  "text-[10px] font-bold flex items-center mt-1",
                  asset.trend > 0 ? "text-green-600" : asset.trend < 0 ? "text-red-600" : "text-muted-foreground"
                )}>
                  {formatPercentage(asset.trend)}
                  {asset.trend !== 0 && (
                    <IconTrendingUp className={cn("ml-0.5 size-3", asset.trend < 0 && "rotate-180")} />
                  )}
                </span>
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter className="pt-0 flex-col items-start gap-2">
            <div className="h-1 w-full bg-secondary rounded-full">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", getAssetClassColor(asset.assetClass))}
                style={{ width: `${Math.min(asset.allocation, 100)}%` }}
              />
            </div>
          </CardFooter>
        </Card>
      ))}
      
      {/* Total Card */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription className="text-primary font-semibold">Total Portfolio</CardDescription>
          <CardTitle className="text-xl font-bold text-primary">
            {formatCurrency(totalValue)}
          </CardTitle>
          <CardAction>
            <div className="flex flex-col items-end">
              <Badge className="text-[10px] py-0 px-1.5">100%</Badge>
              <span className={cn(
                "text-[10px] font-bold flex items-center mt-1",
                totalTrend > 0 ? "text-green-600" : totalTrend < 0 ? "text-red-600" : "text-muted-foreground"
              )}>
                {formatPercentage(totalTrend)}
                {totalTrend !== 0 && (
                  <IconTrendingUp className={cn("ml-0.5 size-3", totalTrend < 0 && "rotate-180")} />
                )}
              </span>
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="pt-0">
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground italic">
              Updated: {lastUpdated.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}