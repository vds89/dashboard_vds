"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react";
import { time } from "console";

export function SectionCards({ timeRange }: { timeRange: string }) {
  const [totalIncome, setTotalIncome] = useState<number | null>(null);
  const [totalOutcome, setTotalOutcome] = useState<number | null>(null);
  const [incomeChange, setIncomeChange] = useState<number | null>(null);
  const [outcomeChange, setOutcomeChange] = useState<number | null>(null);
  const [savingRate, setSavingRate] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [income, outcome, incomeChg, outcomeChg] = await Promise.all([
        fetchTotalIncome(timeRange),
        fetchTotalOutcome(timeRange),
        fetchIncomeChange(timeRange),
        fetchOutcomeChange(timeRange),
      ]);
  
      setTotalIncome(income);
      setTotalOutcome(outcome);
      setIncomeChange(incomeChg);
      setOutcomeChange(outcomeChg);
  
      if (income > 0) {
        const rate = ((income - outcome) / income) * 100;
        setSavingRate(rate);
      } else {
        0; // oppure 0, a seconda di cosa vuoi mostrare
      }
    }
  
    fetchData();
  }, [timeRange]);

  const getChangeBadge = (change: number | null) => {
    if (change === null) return null;
    const isPositive = change >= 0;
    const Icon = isPositive ? IconTrendingUp : IconTrendingDown;
    const formatted = `${isPositive ? "+" : ""}${change.toFixed(1)}%`;

    return (
      <Badge variant="outline">
        <Icon className="mr-1" />
        {formatted}
      </Badge>
    );
  };

  const getSavingBadge = (rate: number | null) => {
    if (rate === null) return null;
    const isPositive = rate >= 0;
    const Icon = isPositive ? IconTrendingUp : IconTrendingDown;
    const formatted = `${isPositive ? "+" : ""}${rate.toFixed(1)}%`;
    return (
      <Badge variant="outline">
        <Icon className="mr-1" />
        {formatted}
      </Badge>
    );
  };

  async function fetchTotalIncome(timeRange: string) {
    try {
      const response = await fetch(`/api/finance/total-income?timeRange=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch total income");
      const data = await response.json();
      return data.totalIncome || 0;
    } catch (error) {
      console.error("Error fetching total income:", error);
      return 0;
    }
  }

  async function fetchTotalOutcome(timeRange: string) {
    try {
      const response = await fetch(`/api/finance/total-outcome?timeRange=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch total outcome");
      const data = await response.json();
      return data.totalOutcome || 0;
    } catch (error) {
      console.error("Error fetching total outcome:", error);
      return 0;
    }
  }
  async function fetchIncomeChange(timeRange: string) {
    try {
      const response = await fetch(`/api/finance/monthly-comparison?timeRange=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch total outcome");
      const data = await response.json();
      return data.incomeChange || 0;
    } catch (error) {
      console.error("Error fetching total outcome:", error);
      return 0;
    }
  }
  async function fetchOutcomeChange(timeRange: string) {
    try {
      const response = await fetch(`/api/finance/monthly-comparison?timeRange=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch total outcome");
      const data = await response.json();
      return data.outcomeChange || 0;
    } catch (error) {
      console.error("Error fetching total outcome:", error);
      return 0;
    }
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total {timeRange} Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {totalIncome !== null ? `$${totalIncome.toLocaleString()}` : "Loading..."}
          </CardTitle>
          <CardAction>{getChangeBadge(incomeChange)}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {incomeChange !== null && incomeChange >= 0
              ? "Trending up this month"
              : "Trending down this month"}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total Incomes over the selected period
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total {timeRange} Outcome</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalOutcome !== null ? `$${totalOutcome.toLocaleString()}` : "Loading..."}
          </CardTitle>
          <CardAction>{getChangeBadge(outcomeChange)}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {outcomeChange !== null && outcomeChange >= 0
              ? "Trending up this month"
              : "Trending down this month"}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total Outcomes over the selected period
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Saving Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {savingRate !== null ? `${savingRate.toFixed(1)}%` : "Loading..."}
          </CardTitle>
          <CardAction>{getSavingBadge(savingRate)}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {savingRate !== null && savingRate >= 0
              ? "Good saving performance"
              : "Negative savings"}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Based on total income vs outcome
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

