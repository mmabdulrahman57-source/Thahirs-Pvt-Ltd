/**
 * Local Cloudinary diagnostic — run: node scripts/test-cloudinary.js
 * Requires backend/.env with valid Cloudinary credentials.
 */
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env'), override: true });

const { runCloudinaryDiagnostics } = await import('../src/utils/cloudinary.js');
const result = await runCloudinaryDiagnostics();
console.log(JSON.stringify(result, null, 2));
process.exit(result.upload?.ok ? 0 : 1);
