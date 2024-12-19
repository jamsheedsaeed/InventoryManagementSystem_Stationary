import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch uniforms with stock below threshold
    const uniforms = await prisma.uniform.findMany({
      select: {
        id: true,
        name: true,
        size: true,
        stock: true,
        lowStockThreshold: true,
        school: { select: { name: true } },
      },
    });
    
    // Filter in JavaScript
    const lowStockItems = uniforms.filter(
      (item) => item.stock <= item.lowStockThreshold
    );
    

    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock items." },
      { status: 500 }
    );
  }
}
