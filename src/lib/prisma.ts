import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function makePrisma() {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  const url = raw.startsWith("file:") ? raw : `file:${raw}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaLibSql({ url } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || makePrisma();
export { makePrisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
