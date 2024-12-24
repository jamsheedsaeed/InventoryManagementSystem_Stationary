import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug // 'a', 'b', or 'c'

    // Parse the sale ID
    const saleId = parseInt(slug);

    if (isNaN(saleId)) {
      return NextResponse.json(
        { error: "Invalid sale ID" },
        { status: 400 }
      );
    }

    // Fetch the sale and related items
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        uniforms: {
          include: {
            uniform: true, // Include uniform details for restocking
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }

    // Restock uniforms sold in this sale
    const restockPromises = sale.uniforms.map((item) => {
      return prisma.uniform.update({
        where: { id: item.uniformId },
        data: {
          stock: {
            increment: item.quantity, // Add the sold quantity back to stock
          },
        },
      });
    });

    await Promise.all(restockPromises);

    // Delete sale items first
    await prisma.saleItem.deleteMany({
      where: { saleId },
    });

    // Delete the sale
    await prisma.sale.delete({
      where: { id: saleId },
    });

    return NextResponse.json({ message: "Sale deleted and items restocked successfully." });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Failed to delete sale. Please try again." },
      { status: 500 }
    );
  }
}
