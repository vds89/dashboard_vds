"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// --- Types ---

interface PortfolioEntry {
  // id: string  <-- RIMOSSO: Non esiste nel DB
  month: string | Date // Questa è la nostra Chiave Primaria
  
  // Income & Expenses
  fixedIncome: number
  variableIncome: number
  fixedExpenses: number
  variableExpenses: number

  // Liquidity
  ing: number
  bbva: number
  revolut: number
  directa: number

  // Stocks
  mwrd: number
  mwrdPrice?: number // Opzionali per evitare errori se mancano nel fetch raw
  smea: number
  smeaPrice?: number
  xmme: number
  xmmePrice?: number

  // Other Assets
  bond: number
  cometa: number

  // Crypto
  eth: number
  ethPrice?: number
  sol: number
  solPrice?: number
  link: number
  linkPrice?: number
  op: number
  opPrice?: number
  usdt: number 
}

// --- Helper Functions ---

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value)
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
}

const isPriceOrValue = (key: string) => {
  const quantityKeys = ["mwrd", "smea", "xmme", "eth", "sol", "link", "op"]
  const metaKeys = ["month", "id"] // id lasciato per sicurezza nel filtro, ma non c'è
  if (metaKeys.includes(key)) return false
  if (quantityKeys.includes(key)) return false 
  return true 
}

// --- Main Component ---

export default function AnalyticsPage() {
  const [data, setData] = React.useState<PortfolioEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deletingMonth, setDeletingMonth] = React.useState<string | null>(null) // Cambiato da ID a Month

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/portfolio/monthly-data")
      if (!response.ok) throw new Error("Failed to fetch data")
      const jsonData = await response.json()
      setData(jsonData)
    } catch (error) {
      console.error("Error fetching database:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // Modificato per accettare la data (stringa o oggetto)
  const handleDelete = async (monthRaw: string | Date) => {
    if (!confirm("Are you sure you want to delete this record? This cannot be undone.")) return

    // Assicuriamoci di avere una stringa valida da passare all'API
    const monthString = typeof monthRaw === 'string' ? monthRaw : monthRaw.toISOString();
    
    setDeletingMonth(monthString)

    try {
      // Passiamo ?month=... invece di ?id=...
      const response = await fetch(`/api/portfolio/monthly-data?month=${encodeURIComponent(monthString)}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast.success("Record deleted successfully")
      
      // Rimuoviamo dalla tabella locale usando il campo month
      setData((prev) => prev.filter((item) => {
        const itemDate = new Date(item.month).toISOString();
        const deletedDate = new Date(monthString).toISOString();
        return itemDate !== deletedDate;
      }))
    } catch (error) {
      console.error("Error deleting:", error)
      toast.error("Failed to delete record")
    } finally {
      setDeletingMonth(null)
    }
  }

  // Headers dinamici (escludendo 'month' dalla lista generica se vogliamo metterlo a mano, o tenendolo)
  // Qui lo teniamo ma gestiamo la colonna Actions separatamente
  const headers = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'month' && k !== 'id') : []

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Database Viewer</h1>
              <p className="text-muted-foreground">Manage your MonthlyPortfolio entries.</p>
            </div>
            {!loading && <Badge variant="outline" className="text-base">{data.length} Records</Badge>}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Records</CardTitle>
              <CardDescription>View and manage your monthly snapshots.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && data.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center">
                   <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Actions</TableHead>
                          <TableHead>Month</TableHead>
                          {headers.map((header) => (
                            <TableHead key={header} className="whitespace-nowrap capitalize">
                              {header.replace(/([A-Z])/g, " $1").trim()}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row) => {
                          // Usiamo la data come chiave univoca
                          const rowKey = typeof row.month === 'string' ? row.month : new Date(row.month).toISOString();
                          
                          return (
                            <TableRow key={rowKey}>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                  disabled={deletingMonth === rowKey}
                                  onClick={() => handleDelete(row.month)}
                                >
                                  {deletingMonth === rowKey ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              
                              <TableCell className="font-medium whitespace-nowrap">
                                {formatDate(row.month)}
                              </TableCell>

                              {headers.map((header) => {
                                const value = row[header as keyof PortfolioEntry]
                                let displayValue: React.ReactNode = value as React.ReactNode

                                if (typeof value === "number") {
                                  displayValue = isPriceOrValue(header) ? formatCurrency(value) : formatNumber(value)
                                }
                                return (
                                  <TableCell key={`${rowKey}-${header}`} className="whitespace-nowrap">
                                    {displayValue}
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}