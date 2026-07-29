import { v2 as cloudinary } from 'cloudinary';
import { existsSync, unlinkSync } from 'fs';

function env(name) {
  return process.env[name]?.trim() || '';
}

let configured = false;

export function isCloudinaryConfigured() {
  return Boolean(
    env('CLOUDINARY_CLOUD_NAME') &&
    env('CLOUDINARY_API_KEY') &&
    env('CLOUDINARY_API_SECRET')
  );
}

export function configureCloudinary() {
  if (configured) return;

  cloudinary.config({
    cloud_name: env('CLOUDINARY_CLOUD_NAME'),
    api_key: env('CLOUDINARY_API_KEY'),
    api_secret: env('CLOUDINARY_API_SECRET'),
    secure: true,
  });

  configured = true;
  console.log('[cloudinary] Configured cloud:', env('CLOUDINARY_CLOUD_NAME'));
}

export function getCloudinaryStatus() {
  return {
    configured: isCloudinaryConfigured(),
    cloudName: env('CLOUDINARY_CLOUD_NAME') || null,
    hasApiKey: Boolean(env('CLOUDINARY_API_KEY')),
    hasApiSecret: Boolean(env('CLOUDINARY_API_SECRET')),
  };
}

export async function uploadProductImage(file) {
  if (!file?.path) throw new Error('No file provided');

  if (!isCloudinaryConfigured()) {
    if (process.env.VERCEL) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel.');
    }
    return `/uploads/products/${file.filename}`;
  }

  if (!existsSync(file.path)) {
    throw new Error(`Upload file not found: ${file.path}`);
  }

  configureCloudinary();

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'thahirs/products',
      resource_type: 'image',
    });
    return result.secure_url;
  } finally {
    try { unlinkSync(file.path); } catch { /* ignore */ }
  }
}
