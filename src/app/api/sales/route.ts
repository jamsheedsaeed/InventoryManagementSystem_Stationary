import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { cart, discount } = await req.json(); // Include discount
    console.log('Received cart:', cart);
    console.log('Discount:', discount);

    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Cannot complete sale." },
        { status: 400 }
      );
    }

    // Extract schoolId from the first item
    const firstItem = cart[0];
    const schoolId = firstItem.schoolId;

    if (typeof schoolId !== 'number') {
      throw new Error("Invalid or missing schoolId in cart items.");
    }

    // // Verify that all items belong to the same school
    // const uniqueSchoolIds = new Set(cart.map(item => item.schoolId));
    // if (uniqueSchoolIds.size > 1) {
    //   throw new Error("All items in the cart must belong to the same school.");
    // }

    // Verify that the school exists
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      throw new Error(`School with ID ${schoolId} does not exist.`);
    }

    // Initialize total and profit
    let total = 0;
    let profit = 0;

    // Update stock and calculate total/profit
    const saleItems = await Promise.all(
      cart.map(async (item: any) => {
        const uniform = await prisma.uniform.findUnique({
          where: { id: item.id },
        });

        if (!uniform) {
          throw new Error(`Uniform with ID ${item.id} does not exist.`);
        }

        if (uniform.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for uniform: ${item.name}. Available: ${uniform.stock}`
          );
        }

        // if (uniform.schoolId !== schoolId) {
        //   throw new Error(
        //     `Uniform: ${item.name} does not belong to the specified school.`
        //   );
        // }

        // Update stock
        await prisma.uniform.update({
          where: { id: item.id },
          data: { stock: uniform.stock - item.quantity },
        });

        const itemTotal = item.price * item.quantity;
        const itemProfit =
          (item.price - (uniform.costPrice || 0)) * item.quantity; // Corrected profit calculation

        total += itemTotal;
        profit += itemProfit;

        return {
          uniformId: item.id,
          quantity: item.quantity,
          price: item.price,
        };
      })
    );

    console.log("Proceeding to create sale...");

    // Create Sale with discount
    const sale = await prisma.sale.create({
      data: {
        schoolId,
        total,
        profit,
        uniforms: {
          create: saleItems,
        },
      },
    });

    console.log('Sale created successfully:', sale);

    return NextResponse.json({ message: "Sale completed successfully!", sale });
  } catch (error: any) { // Specify error type
    console.error("Error completing sale:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    // Ensure that NextResponse.json is called with valid arguments
    return NextResponse.json(
      { error: error.message || "Failed to complete sale. Please try again." },
      { status: 500 }
    );
  }
}


// GET: Fetch sales data
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filters for date range
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Fetch total sales and sales data
    const totalSales = await prisma.sale.aggregate({
      where,
      _sum: { total: true },
    });

    // Fetch top-selling uniforms
    const topSellingUniforms = await prisma.saleItem.groupBy({
      by: ["uniformId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      where,
      take: 5,
    });

    // Fetch details of top uniforms
    const uniformDetails = await prisma.uniform.findMany({
      where: { id: { in: topSellingUniforms.map((item) => item.uniformId) } },
      select: { id: true, name: true },
    });

    const formattedTopSelling = topSellingUniforms.map((item) => ({
      uniformId: item.uniformId,
      quantity: item._sum.quantity,
      name: uniformDetails.find((u) => u.id === item.uniformId)?.name || "Unknown",
    }));

    return NextResponse.json({
      totalSales: totalSales._sum.total || 0,
      topSellingUniforms: formattedTopSelling,
    });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 });
  }
}
