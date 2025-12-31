"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { FinanceEntryForm } from "@/components/entry-form"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { AnnualIncomeExpensesChart } from "@/components/annual-income-expenses-chart"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import * as React from "react"


export default function Page() {
  const [timeRange, setTimeRange] = React.useState("complete");

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Pass the timeRange to SectionCards */}
              <SectionCards timeRange={timeRange} /> 
              
              {/* Annual Income vs Expenses Chart */}
              <div className="px-4 lg:px-6">
                <AnnualIncomeExpensesChart />
              </div>
              
              <div className="px-4 lg:px-6">
                {/* Pass both timeRange and setTimeRange to ChartAreaInteractive */}
                <ChartAreaInteractive timeRange={timeRange} setTimeRange={setTimeRange} />
              </div>
              
              <FinanceEntryForm />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}