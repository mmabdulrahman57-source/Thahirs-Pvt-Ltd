import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getDatabaseUrl, hasDatabaseUrl } from './utils/dbUrl.js';

dotenv.config();

const globalForPrisma = globalThis;
const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

let lastError = null;
let connected = false;

const databaseUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;

function isMissingTableError(err) {
  const msg = String(err?.message || '');
  return (
    err?.code === 'P2021' ||
    msg.includes("doesn't exist") ||
    msg.includes('Unknown table') ||
    msg.includes('Table') && msg.includes('not found')
  );
}

export async function ensureDatabaseSchema() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.user.count();
    return true;
  } catch (err) {
    if (!isMissingTableError(err)) throw err;

    console.log('[db] Tables missing — running prisma db push...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: backendRoot,
      env: { ...process.env, DATABASE_URL: databaseUrl || process.env.DATABASE_URL },
      stdio: 'pipe',
    });
    console.log('[db] Schema created successfully');
    return true;
  }
}

export async function connectDB() {
  if (!hasDatabaseUrl()) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is invalid');
  }

  await prisma.$connect();
  await ensureDatabaseSchema();
  connected = true;
  lastError = null;
  console.log('[db] MySQL connected via Prisma');
}

export async function disconnectDB() {
  await prisma.$disconnect();
  connected = false;
}

export async function healthCheck() {
  if (!hasDatabaseUrl()) {
    throw new Error('DATABASE_URL is not set');
  }
  await prisma.$queryRaw`SELECT 1`;
  const userCount = await prisma.user.count();
  return { connected: true, userCount };
}

export function getDatabaseStatus() {
  return {
    configured: hasDatabaseUrl(),
    connected,
    lastError: lastError?.message || null,
    host: databaseUrl ? safeHost(databaseUrl) : null,
  };
}

function safeHost(url) {
  const match = url.match(/@([^:/]+)/);
  return match?.[1] || 'unknown';
}

export function setDatabaseError(err) {
  lastError = err;
  connected = false;
}
