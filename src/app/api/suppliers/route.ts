import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all suppliers
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: { uniforms: true },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    // Validate JSON parsing
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid payload, expected JSON object" },
        { status: 400 }
      );
    }

    // Destructure and validate required fields
    const { name, email, phone, leadTime } = body;
    if (!name || !email || !phone || !leadTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save supplier to database
    const newSupplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        leadTime: parseInt(leadTime),
      },
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error adding supplier:", error);
    return NextResponse.json(
      { error: "Failed to add supplier" },
      { status: 500 }
    );
  }
}

