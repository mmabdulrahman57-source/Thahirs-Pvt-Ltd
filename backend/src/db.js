import './env.js';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getDatabaseUrl } from './utils/dbUrl.js';
import { requireDatabaseUrl } from './env.js';

const globalForPrisma = globalThis;
const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

let lastError = null;
let connected = false;
let connectPromise = null;
let prismaInstance = globalForPrisma.prisma ?? null;

function createPrismaClient() {
  const url = getDatabaseUrl() || requireDatabaseUrl();
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
    globalForPrisma.prisma = prismaInstance;
  }
  return prismaInstance;
}

export const prisma = new Proxy({}, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

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
    const url = getDatabaseUrl() || requireDatabaseUrl();
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: backendRoot,
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'pipe',
    });
    console.log('[db] Schema created successfully');
    return true;
  }
}

export async function testDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}

export async function connectDB() {
  if (connected) return;

  if (connectPromise) {
    await connectPromise;
    return;
  }

  connectPromise = (async () => {
    const url = getDatabaseUrl() || requireDatabaseUrl();

    console.log('[db] Connecting to MySQL at', safeHost(url));
    try {
      await prisma.$connect();
      await ensureDatabaseSchema();
      await testDatabaseConnection();
      connected = true;
      lastError = null;
      console.log('[db] Database Connected');
    } catch (err) {
      connected = false;
      lastError = err;
      console.error('[db] Database Connection Failed:', err.message);
      throw err;
    }
  })();

  try {
    await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export async function disconnectDB() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
  }
  connected = false;
}

export async function healthCheck() {
  requireDatabaseUrl();
  await connectDB();
  await testDatabaseConnection();
  const userCount = await prisma.user.count();
  return { connected: true, userCount };
}

export function getDatabaseStatus() {
  const url = getDatabaseUrl();
  return {
    configured: Boolean(url),
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
