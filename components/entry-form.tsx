// components/entry-form.tsx

"use client"

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface FormData {
  month: Date | undefined;
  fixedIncome: string;
  variableIncome: string;
  fixedExpenses: string;
  variableExpenses: string;
  ing: string;
  bbva: string;
  revolut: string;
  directa: string;
  mwrd: string;
  smea: string;
  xmme: string;
  bond: string;
  eth: string;
  sol: string;
  link: string;
  op: string;
  usdt: string;
  cometa: string;
}

export function FinanceEntryForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<FormData>({
    month: undefined,
    fixedIncome: "",
    variableIncome: "",
    fixedExpenses: "",
    variableExpenses: "",
    ing: "",
    bbva: "",
    revolut: "",
    directa: "",
    mwrd: "",
    smea: "",
    xmme: "",
    bond: "",
    eth: "",
    sol: "",
    link: "",
    op: "",
    usdt: "",
    cometa: "",
  });

  const handleInputChange = (field: keyof FormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.month) {
      setMessage("Please select a month");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/portfolio/monthly-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: formData.month.toISOString(),
          fixedIncome: parseFloat(formData.fixedIncome) || 0,
          variableIncome: parseFloat(formData.variableIncome) || 0,
          fixedExpenses: parseFloat(formData.fixedExpenses) || 0,
          variableExpenses: parseFloat(formData.variableExpenses) || 0,
          ing: parseFloat(formData.ing) || 0,
          bbva: parseFloat(formData.bbva) || 0,
          revolut: parseFloat(formData.revolut) || 0,
          directa: parseFloat(formData.directa) || 0,
          mwrd: parseFloat(formData.mwrd) || 0,
          smea: parseFloat(formData.smea) || 0,
          xmme: parseFloat(formData.xmme) || 0,
          bond: parseFloat(formData.bond) || 0,
          eth: parseFloat(formData.eth) || 0,
          sol: parseFloat(formData.sol) || 0,
          link: parseFloat(formData.link) || 0,
          op: parseFloat(formData.op) || 0,
          usdt: parseFloat(formData.usdt) || 0,
          cometa: parseFloat(formData.cometa) || 0,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      
      setMessage("Portfolio entry saved successfully!");
      // Reset form
      setFormData({
        month: undefined,
        fixedIncome: "",
        variableIncome: "",
        fixedExpenses: "",
        variableExpenses: "",
        ing: "",
        bbva: "",
        revolut: "",
        directa: "",
        mwrd: "",
        smea: "",
        xmme: "",
        bond: "",
        eth: "",
        sol: "",
        link: "",
        op: "",
        usdt: "",
        cometa: "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Portfolio Monthly Entry</CardDescription>
          <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl">
            Insert Monthly Financial & Portfolio Data
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 pt-2">
          {/* Month Selector */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="month">Select Month</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="month"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.month && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.month ? format(formData.month, "MMMM yyyy") : "Pick a month"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.month}
                  onSelect={(date) => setFormData(prev => ({ ...prev, month: date }))}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="pension">Pension</TabsTrigger>
            </TabsList>

            {/* Income & Expenses Tab */}
            <TabsContent value="income" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fixedIncome">Fixed Income (EUR)</Label>
                  <Input
                    id="fixedIncome"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.fixedIncome}
                    onChange={(e) => handleInputChange('fixedIncome', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="variableIncome">Variable Income (EUR)</Label>
                  <Input
                    id="variableIncome"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.variableIncome}
                    onChange={(e) => handleInputChange('variableIncome', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fixedExpenses">Fixed Expenses (EUR)</Label>
                  <Input
                    id="fixedExpenses"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.fixedExpenses}
                    onChange={(e) => handleInputChange('fixedExpenses', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="variableExpenses">Variable Expenses (EUR)</Label>
                  <Input
                    id="variableExpenses"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.variableExpenses}
                    onChange={(e) => handleInputChange('variableExpenses', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Liquidity Tab */}
            <TabsContent value="liquidity" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ing">ING (EUR)</Label>
                  <Input
                    id="ing"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.ing}
                    onChange={(e) => handleInputChange('ing', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bbva">BBVA (EUR)</Label>
                  <Input
                    id="bbva"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.bbva}
                    onChange={(e) => handleInputChange('bbva', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="revolut">REVOLUT (EUR)</Label>
                  <Input
                    id="revolut"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.revolut}
                    onChange={(e) => handleInputChange('revolut', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="directa">DIRECTA (EUR)</Label>
                  <Input
                    id="directa"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.directa}
                    onChange={(e) => handleInputChange('directa', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Stocks Tab */}
            <TabsContent value="stocks" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="mwrd">MWRD (Stocks)</Label>
                  <Input
                    id="mwrd"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.mwrd}
                    onChange={(e) => handleInputChange('mwrd', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="smea">SMEA (Stocks)</Label>
                  <Input
                    id="smea"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.smea}
                    onChange={(e) => handleInputChange('smea', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="xmme">XMME (Stocks)</Label>
                  <Input
                    id="xmme"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.xmme}
                    onChange={(e) => handleInputChange('xmme', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bond">BOND (EUR)</Label>
                  <Input
                    id="bond"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.bond}
                    onChange={(e) => handleInputChange('bond', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Crypto Tab */}
            <TabsContent value="crypto" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="eth">ETH (Units)</Label>
                  <Input
                    id="eth"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0"
                    value={formData.eth}
                    onChange={(e) => handleInputChange('eth', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sol">SOL (Units)</Label>
                  <Input
                    id="sol"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.sol}
                    onChange={(e) => handleInputChange('sol', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="link">LINK (Units)</Label>
                  <Input
                    id="link"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.link}
                    onChange={(e) => handleInputChange('link', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="op">OP (Units)</Label>
                  <Input
                    id="op"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.op}
                    onChange={(e) => handleInputChange('op', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="usdt">USDT (Units)</Label>
                  <Input
                    id="usdt"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.usdt}
                    onChange={(e) => handleInputChange('usdt', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Pension Tab */}
            <TabsContent value="pension" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cometa">COMETA (EUR)</Label>
                  <Input
                    id="cometa"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.cometa}
                    onChange={(e) => handleInputChange('cometa', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.month}
            className="mt-2 w-full"
          >
            {loading ? "Saving..." : "Save Portfolio Entry"}
          </Button>

          {message && (
            <p className={cn(
              "text-center text-sm",
              message.includes("success") ? "text-green-600" : "text-red-600"
            )}>
              {message}
            </p>
          )}
        </CardContent>

        <CardFooter className="text-muted-foreground text-xs pt-4">
          You can insert or update one entry per month. All values default to 0 if left empty.
        </CardFooter>
      </Card>
    </div>
  );
}