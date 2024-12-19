import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { uniformId, lowStockThreshold } = await req.json();

    // Validate input
    if (!uniformId || lowStockThreshold < 0) {
      return NextResponse.json(
        { error: "Invalid input data." },
        { status: 400 }
      );
    }

    // Update the lowStockThreshold
    const updatedUniform = await prisma.uniform.update({
      where: { id: uniformId },
      data: { lowStockThreshold },
    });

    return NextResponse.json({
      message: "Low stock threshold updated successfully!",
      updatedUniform,
    });
  } catch (error) {
    console.error("Error updating low stock threshold:", error);
    return NextResponse.json(
      { error: "Failed to update low stock threshold." },
      { status: 500 }
    );
  }
}
