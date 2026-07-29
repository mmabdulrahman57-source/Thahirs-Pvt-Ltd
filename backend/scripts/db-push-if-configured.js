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
execSync('npx prisma db push --skip-generate --accept-data-loss', {
  cwd: backendRoot,
  stdio: 'inherit',
  env: process.env,
});
