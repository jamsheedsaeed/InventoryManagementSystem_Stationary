import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

const prisma = new PrismaClient();

// Configuration to disable body parsing for file uploads
export const config = {
  api: { bodyParser: false },
};

/**
 * Helper function to convert a Web API Request body into a readable stream.
 * @param req Web API Request object
 */
async function convertRequestToStream(req: Request): Promise<Readable> {
  const reader = req.body?.getReader();
  const stream = new Readable({
    async read() {
      const { value, done } = await reader!.read();
      if (done) this.push(null);
      else this.push(value);
    },
  });
  return stream;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract form fields
    const name = formData.get("name")?.toString();
    const size = formData.get("size")?.toString();
    const price = parseFloat(formData.get("price")?.toString() || "0");
    const costPrice = parseFloat(formData.get("costPrice")?.toString() || "0");
    const stock = parseInt(formData.get("stock")?.toString() || "0");
    const schoolId = parseInt(formData.get("schoolId")?.toString() || "0");
    const supplierId = formData.get("supplierId")
      ? parseInt(formData.get("supplierId")?.toString() || "0")
      : null;

    console.log("Received Fields:", { name, size, price, stock, schoolId, supplierId });

    if (!name || !size || !price || !stock || !schoolId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract and process the image
    let imageBuffer = null;
    const imageFile = formData.get("image") as File | null;

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer
    }

    // Construct the data object for Prisma
    const data = {
      name,
      size,
      price,
      costPrice,
      stock,
      schoolId,
      ...(supplierId && { supplierId }),
      ...(imageBuffer && { image: imageBuffer }),
    };

    console.log("Final Payload for Prisma:", data);

    // Save uniform to the database
    const newUniform = await prisma.uniform.create({
      data,
    });

    console.log("New Uniform Added:", newUniform);

    return NextResponse.json(newUniform, { status: 201 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { error: "Failed to add uniform" },
      { status: 500 }
    );
  }
}




/**
 * GET: Fetch uniforms (all or filtered by schoolId)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

    const uniforms = await prisma.uniform.findMany({
      where: schoolId ? { schoolId: Number(schoolId) } : undefined,
      select: {
        id: true,
        name: true,
        size: true,
        price: true,
        stock: true,
        image: true,
        imageUrl: true, // Ensure imageUrl is included
      },
    });


    const formattedUniforms = uniforms.map((uniform) => ({
      ...uniform,
      image: uniform.image
        ? `data:image/jpeg;base64,${Buffer.from(uniform.image).toString("base64")}`
        : null, // Convert BLOB to Base64, or null if no image
    }));

    return NextResponse.json(formattedUniforms);
  } catch (error) {
    console.error("Error fetching uniforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch uniforms" },
      { status: 500 }
    );
  }
}


/**
 * Helper: Parse multipart/form-data request
 */
async function parseMultipartFormData(req: Request, boundary: string) {
  const stream = await convertRequestToStream(req);

  const formData = { fields: {}, files: {} } as {
    fields: Record<string, string>;
    files: Record<string, { filename: string; stream: Readable }>;
  };

  const decoder = new TextDecoder();
  let currentField = "";

  for await (const chunk of stream) {
    const data = decoder.decode(chunk, { stream: true });
    if (data.includes(boundary)) {
      const lines = data.split("\r\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Content-Disposition: form-data; name="')) {
          const match = line.match(/name="(.*?)"/);
          currentField = match?.[1] || "";
        } else if (line.startsWith("Content-Type:")) {
          // File handling
          const filenameMatch = lines[i - 1].match(/filename="(.*?)"/);
          const filename = filenameMatch?.[1] || `file_${Date.now()}`;
          const fileStream = new Readable();
          fileStream.push(chunk);
          fileStream.push(null);

          formData.files[currentField] = {
            filename,
            stream: fileStream,
          };
          currentField = "";
        } else if (currentField) {
          formData.fields[currentField] = line;
          currentField = "";
        }
      }
    }
  }

  return formData;
}
