import multer from 'multer';
import { mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ensureDir, isServerless, serverlessPath } from './serverless.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = isServerless
  ? serverlessPath('thahirs-uploads')
  : join(__dirname, '../../uploads');
export const PRODUCT_UPLOAD_DIR = join(UPLOAD_ROOT, 'products');

ensureDir(UPLOAD_ROOT);
ensureDir(PRODUCT_UPLOAD_DIR);

const diskStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, PRODUCT_UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

/** Memory storage is more reliable on Vercel serverless; file is written to /tmp before Cloudinary upload */
const storage = isServerless ? multer.memoryStorage() : diskStorage;

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
  },
});

/** Ensure multer file has a readable path for cloudinary.uploader.upload() */
export function prepareUploadFile(file) {
  if (!file) throw new Error('No file provided');

  if (file.buffer?.length) {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const tempDir = join(tmpdir(), 'thahirs-uploads');
    mkdirSync(tempDir, { recursive: true });
    const tempPath = join(tempDir, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    writeFileSync(tempPath, file.buffer);
    return { path: tempPath, size: file.buffer.length, cleanup: () => {
      try { unlinkSync(tempPath); } catch { /* ignore */ }
    }};
  }

  if (file.path) {
    return { path: file.path, size: file.size, cleanup: () => {} };
  }

  throw new Error('Upload file has no buffer or path');
}
