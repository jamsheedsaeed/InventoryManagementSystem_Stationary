import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function GET() {
    try {
      const topSellingItems = await prisma.saleItem.groupBy({
        by: ["uniformId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10, // Top 10 items
      });
  
      const detailedTopSelling = await Promise.all(
        topSellingItems.map(async (item) => {
          const uniform = await prisma.uniform.findUnique({ where: { id: item.uniformId } });
          return {
            id: item.uniformId,
            name: uniform?.name || "Unknown",
            quantitySold: item._sum.quantity,
          };
        })
      );
  
      return NextResponse.json(detailedTopSelling);
    } catch (error) {
      console.error("Error fetching top-selling items:", error);
      return NextResponse.json({ error: "Failed to fetch top-selling items." }, { status: 500 });
    }
  }
  