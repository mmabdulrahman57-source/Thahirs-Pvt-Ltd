import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;

export async function connectDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  await prisma.$connect();
  console.log('MySQL connected via Prisma');
}

export async function disconnectDB() {
  await prisma.$disconnect();
}

export async function healthCheck() {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}
