import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all stock adjustments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Filter by date range if provided
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const adjustments = await prisma.stockAdjustment.findMany({
      where,
      include: {
        uniform: {
          select: {
            name: true,
            size: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error("Error fetching stock adjustments:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock adjustments." },
      { status: 500 }
    );
  }
}
