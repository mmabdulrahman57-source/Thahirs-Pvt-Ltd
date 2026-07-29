/**
 * Local Cloudinary diagnostic — run: npm run test:cloudinary
 */
import '../src/env.js';
import { runCloudinaryDiagnostics, logCloudinaryStartup } from '../src/utils/cloudinary.js';

logCloudinaryStartup();
const result = await runCloudinaryDiagnostics();
console.log(JSON.stringify(result, null, 2));
process.exit(result.upload?.ok ? 0 : 1);
