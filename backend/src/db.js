import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDB() {
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
