import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const schools = await prisma.school.findMany();
  return NextResponse.json(schools);
}

export async function POST(req: Request) {
  const { name, address, phone, principal } = await req.json();
  const school = await prisma.school.create({
    data: { name, address, phone, principal },
  });
  return NextResponse.json(school);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.school.delete({
    where: { id: Number(id) },
  });
  return NextResponse.json({ message: "School deleted successfully" });
}
