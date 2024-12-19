import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all uniforms
export async function GET() {
  try {
    const uniforms = await prisma.uniform.findMany({
      include: {
        school: true, // Include associated school details
      },
    });

    return NextResponse.json(uniforms);
  } catch (error) {
    console.error("Error fetching all uniforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch all uniforms" },
      { status: 500 }
    );
  }
}
