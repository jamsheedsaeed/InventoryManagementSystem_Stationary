import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash("12345m", 10);

  await prisma.user.upsert({
    where: { email: "normal@school.com" },
    update: {}, // Do nothing if user exists
    create: {
      email: "normal@school.com",
      password: hashedPassword,
      role: "normal",
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
