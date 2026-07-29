import { v2 as cloudinary } from 'cloudinary';
import { readFileSync, unlinkSync } from 'fs';

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadProductImage(file) {
  if (!file) throw new Error('No file provided');

  if (isCloudinaryConfigured()) {
    configureCloudinary();
    try {
      const buffer = readFileSync(file.path);
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'thahirs/products', resource_type: 'image' },
          (err, res) => (err ? reject(err) : resolve(res))
        ).end(buffer);
      });
      return result.secure_url;
    } finally {
      try { unlinkSync(file.path); } catch { /* ignore */ }
    }
  }

  return `/uploads/products/${file.filename}`;
}
