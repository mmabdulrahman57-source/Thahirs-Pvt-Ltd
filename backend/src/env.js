import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const BACKEND_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = join(BACKEND_ROOT, '..');

const ENV_FILES = [
  { path: join(BACKEND_ROOT, '.env'), override: true },
  { path: join(REPO_ROOT, '.env'), override: false },
  { path: join(REPO_ROOT, '.env.local'), override: false },
];

let loadedFrom = null;

for (const { path, override } of ENV_FILES) {
  if (!existsSync(path)) continue;
  const result = dotenv.config({ path, override });
  if (!result.error) {
    loadedFrom = loadedFrom || path;
  }
}

if (!process.env.DATABASE_URL?.trim() && process.env.MYSQL_ADDON_URI?.trim()) {
  process.env.DATABASE_URL = process.env.MYSQL_ADDON_URI.trim();
}

export function maskDatabaseUrl(url) {
  if (!url) return null;
  const cleaned = url.replace(/^["']|["']$/g, '');
  try {
    const normalized = cleaned.replace(/^mysql:\/\//, 'https://');
    const parsed = new URL(normalized);
    const user = parsed.username ? '***' : '';
    const port = parsed.port || '3306';
    return `mysql://${user}@${parsed.hostname}:${port}${parsed.pathname}`;
  } catch {
    return '(invalid DATABASE_URL)';
  }
}

export function getEnvSource() {
  if (loadedFrom) return loadedFrom;
  if (process.env.VERCEL) return 'Vercel platform environment';
  return 'process environment';
}

export function logDatabaseEnv() {
  const raw = process.env.DATABASE_URL?.trim();
  console.log('[env] DATABASE_URL:', raw ? maskDatabaseUrl(raw) : '(not set)');
  console.log('[env] Environment loaded from:', getEnvSource());
}

export function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim()?.replace(/^["']|["']$/g, '');
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add it to backend/.env for local development or to Vercel Environment Variables for production (use MYSQL_ADDON_URI from Clever Cloud).'
    );
  }
  return url;
}

export function initEnv() {
  logDatabaseEnv();
  requireDatabaseUrl();
}
