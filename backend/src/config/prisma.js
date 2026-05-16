import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let prisma;

try {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "test") {
    console.log("Prisma client initialized successfully");
  }
} catch (error) {
  if (process.env.NODE_ENV !== "test") {
    console.error("Failed to initialize Prisma client:", error.message);
  }
  prisma = null;
}

export default prisma;
