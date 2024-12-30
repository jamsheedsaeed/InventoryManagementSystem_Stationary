import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
      const salesData = await prisma.sale.groupBy({
        by: ["date"],
        _sum: { total: true },
        orderBy: { date: "asc" },
      });
  
      const trends = salesData.map((entry) => ({
        date: entry.date.toISOString().split("T")[0], // Format date
        totalSales: entry._sum.total,
      }));
  
      return NextResponse.json(trends);
    } catch (error) {
      console.error("Error fetching sales trends:", error);
      return NextResponse.json({ error: "Failed to fetch sales trends." }, { status: 500 });
    }
  }
  