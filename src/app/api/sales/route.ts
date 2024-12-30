import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const {  cart } = await req.json();
    const schoolId = 1;
    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Cannot complete sale." },
        { status: 400 }
      );
    }

    // Calculate total and profit
    let total = 0;
    let profit = 0;

    // Update stock and calculate total/profit
    const saleItems = await Promise.all(
      cart.map(async (item: any) => {
        const uniform = await prisma.uniform.findUnique({
          where: { id: item.id },
        });

        if (!uniform || uniform.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for uniform: ${item.name}. Available: ${uniform?.stock}`
          );
        }
        // Update stock
        await prisma.uniform.update({
          where: { id: item.id },
          data: { stock: uniform.stock - item.quantity },
        });

        const itemTotal = item.price * item.quantity;
        const itemProfit =
          ((uniform.costPrice || 0) - item.price) * item.quantity;

        total += itemTotal;
        profit += itemProfit;

        return {
          uniformId: item.id,
          quantity: item.quantity,
          price: item.price,
        };
      })
    );

    // Create Sale
    const sale = await prisma.sale.create({
      data: {
        schoolId,
        total,
        profit,
        uniforms: {
          create: saleItems,
        },
      },
    });

    return NextResponse.json({ message: "Sale completed successfully!", sale });
  } catch (error) {
    console.error("Error completing sale:", error);
    return NextResponse.json(
      { error: "Failed to complete sale. Please try again." },
      { status: 500 }
    );
  }
}

// GET: Fetch sales data
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filters for date range
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Fetch total sales and sales data
    const totalSales = await prisma.sale.aggregate({
      where,
      _sum: { total: true },
    });

    // Fetch top-selling uniforms
    const topSellingUniforms = await prisma.saleItem.groupBy({
      by: ["uniformId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      where,
      take: 5,
    });

    // Fetch details of top uniforms
    const uniformDetails = await prisma.uniform.findMany({
      where: { id: { in: topSellingUniforms.map((item) => item.uniformId) } },
      select: { id: true, name: true },
    });

    const formattedTopSelling = topSellingUniforms.map((item) => ({
      uniformId: item.uniformId,
      quantity: item._sum.quantity,
      name: uniformDetails.find((u) => u.id === item.uniformId)?.name || "Unknown",
    }));

    return NextResponse.json({
      totalSales: totalSales._sum.total || 0,
      topSellingUniforms: formattedTopSelling,
    });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 });
  }
}
