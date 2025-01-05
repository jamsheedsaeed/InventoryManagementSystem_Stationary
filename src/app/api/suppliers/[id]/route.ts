import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request,
    { params }: { params: Promise<{ id: string }> }) {
    try {
      const id =  parseInt((await params).id); 
      const { name, email, phone, leadTime } = await req.json();
  
      const updatedSupplier = await prisma.supplier.update({
        where: { id },
        data: { name, email, phone, leadTime: parseInt(leadTime) },
      });
  
      return NextResponse.json(updatedSupplier, { status: 200 });
    } catch (error) {
      console.error("Error updating supplier:", error);
      return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
    }
  }

  
  export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        const id =  parseInt((await params).id);   
      await prisma.supplier.delete({
        where: { id },
      });
  
      return NextResponse.json({ message: "Supplier deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
    }
  }
  