import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function PUT(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    try {
        const slug = (await params).slug // 'a', 'b', or 'c'

      const schoolId = parseInt(slug);
  
      if (isNaN(schoolId)) {
        return NextResponse.json(
          { error: "Invalid school ID" },
          { status: 400 }
        );
      }
  
      const body = await req.json();
      const { name, address, phone, principal } = body;
  
      if (!name || !address || !phone || !principal) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
  
      const updatedSchool = await prisma.school.update({
        where: { id: schoolId },
        data: {
          name,
          address,
          phone,
          principal,
        },
      });
  
      return NextResponse.json(updatedSchool);
    } catch (error) {
      console.error("Error updating school:", error);
      return NextResponse.json(
        { error: "Failed to update school. Please try again." },
        { status: 500 }
      );
    }
  }

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    const slug = (await params).slug // 'a', 'b', or 'c'
    try {
        const schoolId = parseInt(slug); // Parse `id` into a number
    
        if (isNaN(schoolId)) {
            return NextResponse.json(
            { error: "Invalid school ID" },
            { status: 400 }
          );
        }
    
        const existingSchool = await prisma.school.findUnique({
          where: { id: schoolId },
        });
    
        if (!existingSchool) {
          return NextResponse.json(
            { error: "School not found" },
            { status: 404 }
          );
        }
    
        await prisma.school.delete({ where: { id: schoolId } });
    
        return NextResponse.json({ message: "School deleted successfully" });
      } catch (error) {
        console.error("Error deleting school:", error);
        return NextResponse.json(
          { error: "Failed to delete school. Please try again." },
          { status: 500 }
        );
      }

    console.log(slug);
  }