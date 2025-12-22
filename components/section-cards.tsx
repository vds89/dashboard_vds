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
import { ASSET_CLASS_COLORS, formatCurrency, formatPercentage } from "@/lib/asset-config"

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
      // Map timeRange values to API parameters
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
    return ASSET_CLASS_COLORS[assetClass as keyof typeof ASSET_CLASS_COLORS] || 'bg-gray-500';
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4, 5].map((i) => (
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

  // Error state
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

  // Empty state
  if (assetSummary.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <div className="p-10 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <p className="text-muted-foreground font-medium">No portfolio data available</p>
          <p className="text-xs text-muted-foreground mt-2">
            Use the entry form below to add your first monthly portfolio entry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {assetSummary.map((asset) => (
        <Card key={asset.assetClass} className="@container/card hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardDescription>{asset.assetClass}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(asset.totalQuantity)}
            </CardTitle>
            <CardAction>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className="font-medium">
                  <div className={`h-2.5 w-2.5 rounded-full ${getAssetClassColor(asset.assetClass)} mr-2`}></div>
                  {asset.allocation.toFixed(1)}%
                </Badge>
                {/* MoM Trend Indicator */}
                <span className={cn(
                  "text-[10px] font-bold flex items-center px-1 rounded tracking-tighter",
                  asset.trend > 0 ? "text-green-600 dark:text-green-400" : 
                  asset.trend < 0 ? "text-red-600 dark:text-red-400" : 
                  "text-muted-foreground"
                )}>
                  {formatPercentage(asset.trend)} MoM
                  {asset.trend !== 0 && (
                    <IconTrendingUp className={cn("ml-0.5 size-3", asset.trend < 0 && "rotate-180")} />
                  )}
                </span>
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex justify-between w-full font-medium text-[10px] uppercase tracking-wider text-muted-foreground/70">
              <span>Allocation</span>
              <span>{asset.allocation.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${getAssetClassColor(asset.assetClass)} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(asset.allocation, 100)}%` }}
              ></div>
            </div>
          </CardFooter>
        </Card>
      ))}
      
      {/* Total Portfolio Card */}
      <Card className="@container/card border-primary/20 bg-primary/5 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardDescription className="text-primary font-medium">Total Portfolio Value</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-primary">
            {formatCurrency(totalValue)}
          </CardTitle>
          <CardAction>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                100%
              </Badge>
              <span className={cn(
                "text-[10px] font-bold flex items-center px-1 rounded tracking-tighter",
                totalTrend > 0 ? "text-green-600 dark:text-green-400" : 
                totalTrend < 0 ? "text-red-600 dark:text-red-400" : 
                "text-muted-foreground"
              )}>
                {formatPercentage(totalTrend)} MoM
                {totalTrend !== 0 && (
                  <IconTrendingUp className={cn("ml-0.5 size-3", totalTrend < 0 && "rotate-180")} />
                )}
              </span>
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs text-muted-foreground/80 italic">
          <div className="flex items-center gap-1.5">
            <IconTrendingUp className="size-3.5 text-primary" />
            Consolidated view of all assets
          </div>
          {lastUpdated && (
            <div className="text-[10px]">
              Last updated: {lastUpdated.toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'short' 
              })}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}