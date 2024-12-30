import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Total Stock
    const totalStock = await prisma.uniform.aggregate({
      _sum: { stock: true },
    });

    // Today's Sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaySales = await prisma.sale.findMany({
      where: { date: { gte: today, lt: tomorrow } },
    });

    const totalSalesToday = todaySales.length;
    const totalRevenueToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfitToday = todaySales.reduce((sum, sale) => sum + sale.profit, 0);

    return NextResponse.json({
      totalStock: totalStock._sum.stock || 0,
      totalSalesToday,
      totalRevenueToday,
      totalProfitToday,
    });
  } catch (error) {
    console.error("Error fetching overview data:", error);
    return NextResponse.json({ error: "Failed to fetch overview data." }, { status: 500 });
  }
}
