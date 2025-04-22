import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

export function FinanceEntryForm() {
  const [date, setDate] = useState("");
  const [income, setIncome] = useState("");
  const [outcome, setOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/finance/db-post-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: new Date(date).toISOString(),
          income: parseFloat(income),
          outcome: parseFloat(outcome),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessage("Entry added successfully");
      setDate("");
      setIncome("");
      setOutcome("");
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
            <CardDescription>Add Finance Entry</CardDescription>
            <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl">
            Insert Date, Income & Outcome
            </CardTitle>
        </CardHeader>
    
        <CardContent className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="focus-visible:ring-2 focus-visible:ring-primary"
            />
            </div>
    
            <div className="flex flex-col gap-2">
            <Label htmlFor="income">Income</Label>
            <Input
                id="income"
                type="number"
                placeholder="Income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="focus-visible:ring-2 focus-visible:ring-primary"
            />
            </div>
    
            <div className="flex flex-col gap-2">
            <Label htmlFor="outcome">Outcome</Label>
            <Input
                id="outcome"
                type="number"
                placeholder="Outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="focus-visible:ring-2 focus-visible:ring-primary"
            />
            </div>
    
            <Button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 w-full"
            >
            {loading ? "Saving..." : "Add Entry"}
            </Button>
    
            {message && (
            <p className="text-center text-sm text-muted-foreground">{message}</p>
            )}
        </CardContent>
    
        <CardFooter className="text-muted-foreground text-xs pt-4">
            You can only insert one entry per month.
        </CardFooter>
        </Card>
    </div>

  );
}
