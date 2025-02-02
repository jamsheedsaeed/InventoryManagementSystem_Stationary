import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/sendEmail";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { uniformId, adjustment, reason } = await req.json();
    // Validate input
    if (!uniformId || adjustment <= 0 || !reason) {
      return NextResponse.json(
        { error: "Invalid input data." },
        { status: 400 }
      );
    }
    // Fetch the uniform
    const uniform = await prisma.uniform.findUnique({
      where: { id: uniformId },
    });

    if (!uniform) {
      return NextResponse.json({ error: "Uniform not found." }, { status: 404 });
    }

    // Update stock
    const updatedStock = uniform.stock + adjustment;
    await prisma.uniform.update({
      where: { id: uniformId },
      data: { stock: updatedStock },
    });

    // Log the stock adjustment
    await prisma.stockAdjustment.create({
      data: {
        uniformId,
        adjustment,
        reason,
      },
    });

    // Send low stock alert email if stock falls below the threshold
    if (updatedStock < uniform.lowStockThreshold) {
      await sendEmail(
        "⚠️ Low Stock Alert",
        `<p>The stock for <strong>${uniform.name}</strong> (Size: ${uniform.size}) is now <strong>${updatedStock}</strong> units. The defined threshold is <strong>${uniform.lowStockThreshold}</strong>.</p>
         <p>Please restock this item as soon as possible.</p>`
      );
    }

    return NextResponse.json({
      message: "Stock updated successfully.",
      updatedStock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock." },
      { status: 500 }
    );
  }
}
