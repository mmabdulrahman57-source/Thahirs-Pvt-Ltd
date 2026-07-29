/**
 * Loads backend/.env then runs Prisma CLI with DATABASE_URL available.
 * Usage: node scripts/prisma-env.js db pull
 */
import '../src/env.js';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { requireDatabaseUrl, logDatabaseEnv } from '../src/env.js';

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (!args.length) {
  console.error('Usage: node scripts/prisma-env.js <prisma-command> [args...]');
  process.exit(1);
}

logDatabaseEnv();
const url = requireDatabaseUrl();

const result = spawnSync(
  `npx prisma ${args.map(a => (/\s/.test(a) ? `"${a}"` : a)).join(' ')}`,
  {
    cwd: backendRoot,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, DATABASE_URL: url },
  }
);

process.exit(result.status ?? 1);
