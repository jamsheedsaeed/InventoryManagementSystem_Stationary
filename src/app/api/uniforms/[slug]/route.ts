import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Update Uniform (PUT)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug // 'a', 'b', or 'c'
    const uniformId = parseInt(slug);

    if (isNaN(uniformId)) {
      return NextResponse.json({ error: "Invalid uniform ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, size, price, stock } = body;

    if (!name || !size || price == null || stock == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedUniform = await prisma.uniform.update({
      where: { id: uniformId },
      data: {
        name,
        size,
        price: parseFloat(price),
        stock: parseInt(stock),
      },
    });

    return NextResponse.json(updatedUniform, { status: 200 });
  } catch (error) {
    console.error("Error updating uniform:", error);
    return NextResponse.json(
      { error: "Failed to update uniform" },
      { status: 500 }
    );
  }
}

// Delete Uniform (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug // 'a', 'b', or 'c'

    const uniformId = parseInt(slug);

    if (isNaN(uniformId)) {
      return NextResponse.json({ error: "Invalid uniform ID" }, { status: 400 });
    }

    // Delete related records manually
    await prisma.saleItem.deleteMany({
      where: { uniformId },
    });

    await prisma.stockAdjustment.deleteMany({
      where: { uniformId },
    });

    // Delete the uniform
    await prisma.uniform.delete({
      where: { id: uniformId },
    });

    return NextResponse.json(
      { message: "Uniform deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting uniform:", error);
    return NextResponse.json(
      { error: "Failed to delete uniform. Please try again." },
      { status: 500 }
    );
  }
}