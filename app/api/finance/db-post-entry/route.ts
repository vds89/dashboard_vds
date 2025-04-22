import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { date, income, outcome } = await req.json();

    if (!date || typeof income !== "number" || typeof outcome !== "number") {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    const parsedDate = new Date(date);

    const result = await prisma.vds_finance.upsert({
      where: { date: parsedDate },
      update: { income, outcome },
      create: { date: parsedDate, income, outcome },
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
