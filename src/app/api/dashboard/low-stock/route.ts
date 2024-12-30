import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all uniforms
    const uniforms = await prisma.uniform.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true,
      },
    });

    // Filter low-stock items manually
    const lowStockItems = uniforms.filter(
      (uniform) => uniform.stock < uniform.lowStockThreshold
    );

    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error("Error fetching low-stock items:", error);
    return NextResponse.json(
      { error: "Failed to fetch low-stock items." },
      { status: 500 }
    );
  }
}
