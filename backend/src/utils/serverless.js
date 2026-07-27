import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export function serverlessPath(name) {
  return join('/tmp', name);
}

export function ensureDir(dir) {
  try {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return true;
  } catch (err) {
    console.warn(`Could not create directory ${dir}:`, err.message);
    return false;
  }
}
