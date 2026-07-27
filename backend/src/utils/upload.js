import multer from 'multer';
import { join, extname } from 'path';
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

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, PRODUCT_UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
  },
});
