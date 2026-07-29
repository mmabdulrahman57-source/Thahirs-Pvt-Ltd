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
let connectPromise = null;

function createPrismaClient() {
  const url = getDatabaseUrl();
  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

function isMissingTableError(err) {
  const msg = String(err?.message || '');
  return (
    err?.code === 'P2021' ||
    msg.includes("doesn't exist") ||
    msg.includes('Unknown table') ||
    (msg.includes('Table') && msg.includes('not found'))
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
    const url = getDatabaseUrl() || process.env.DATABASE_URL?.trim();
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: backendRoot,
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'pipe',
    });
    console.log('[db] Schema created successfully');
    return true;
  }
}

export async function connectDB() {
  if (connected) return;

  if (connectPromise) {
    await connectPromise;
    return;
  }

  connectPromise = (async () => {
    if (!hasDatabaseUrl()) {
      throw new Error('DATABASE_URL is not set');
    }
    const url = getDatabaseUrl();
    if (!url) {
      throw new Error('DATABASE_URL is invalid');
    }

    console.log('[db] Connecting to MySQL at', safeHost(url));
    await prisma.$connect();
    await ensureDatabaseSchema();
    connected = true;
    lastError = null;
    console.log('[db] MySQL connected via Prisma');
  })();

  try {
    await connectPromise;
  } catch (err) {
    connected = false;
    lastError = err;
    throw err;
  } finally {
    connectPromise = null;
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
  connected = false;
}

export async function healthCheck() {
  if (!hasDatabaseUrl()) {
    throw new Error('DATABASE_URL is not set');
  }
  await connectDB();
  await prisma.$queryRaw`SELECT 1`;
  const userCount = await prisma.user.count();
  return { connected: true, userCount };
}

export function getDatabaseStatus() {
  const url = getDatabaseUrl();
  return {
    configured: hasDatabaseUrl(),
    connected,
    lastError: lastError?.message || null,
    host: url ? safeHost(url) : null,
    sslMode: url?.includes('accept_invalid_certs') ? 'accept_invalid_certs' : null,
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

export function isDatabaseConnected() {
  return connected;
}
