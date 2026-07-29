import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.DATABASE_URL?.trim()) {
  console.log('[db] Skipping db push — DATABASE_URL not set');
  process.exit(0);
}

console.log('[db] Running prisma db push...');

try {
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  });
  console.log('[db] Schema push completed');
} catch (err) {
  const msg = String(err.message || err);
  console.error('\n[db] WARNING: prisma db push failed during build.');
  console.error('[db] The frontend will still deploy, but the API needs a valid DATABASE_URL.');

  if (msg.includes('P1000') || msg.includes('Authentication failed')) {
    console.error('[db] Reason: Invalid MySQL username or password in Vercel DATABASE_URL.');
    console.error('[db] Fix: Clever Cloud → MySQL add-on → Information → copy MYSQL_ADDON_URI exactly into Vercel.');
    console.error('[db] If the password contains @ # % & + = encode them (e.g. @ → %40).');
  } else {
    console.error('[db] Reason:', msg);
  }

  // Do not fail the Vercel build — schema can be retried at runtime after credentials are fixed
  process.exit(0);
}
