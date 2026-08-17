import { PrismaClient } from "@prisma/client";

// Prevents creating a new PrismaClient on every hot-reload in development,
// which would otherwise exhaust Postgres connections. In production
// (a single long-running process) this simply creates one client.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
