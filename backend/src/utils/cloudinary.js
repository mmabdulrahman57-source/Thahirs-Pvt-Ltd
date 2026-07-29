import { v2 as cloudinary } from 'cloudinary';
import { existsSync, statSync, unlinkSync } from 'fs';
import { prepareUploadFile } from './upload.js';

function env(name) {
  return process.env[name]?.trim() || '';
}

export function isCloudinaryConfigured() {
  return Boolean(
    env('CLOUDINARY_CLOUD_NAME') &&
    env('CLOUDINARY_API_KEY') &&
    env('CLOUDINARY_API_SECRET')
  );
}

/** Always reconfigure — serverless instances must not cache stale credentials */
export function configureCloudinary() {
  cloudinary.config({
    cloud_name: env('CLOUDINARY_CLOUD_NAME'),
    api_key: env('CLOUDINARY_API_KEY'),
    api_secret: env('CLOUDINARY_API_SECRET'),
    secure: true,
  });
}

export function getCloudinaryStatus() {
  return {
    configured: isCloudinaryConfigured(),
    cloudName: env('CLOUDINARY_CLOUD_NAME') || null,
    hasApiKey: Boolean(env('CLOUDINARY_API_KEY')),
    hasApiSecret: Boolean(env('CLOUDINARY_API_SECRET')),
  };
}

function formatCloudinaryError(err) {
  const httpCode = err?.http_code ?? err?.error?.http_code;
  const message = err?.message ?? err?.error?.message ?? String(err);

  if (httpCode === 403) {
    return `Cloudinary upload forbidden (403). Authentication works (ping ok) but this API key cannot upload. In Cloudinary Dashboard → Settings → Access Keys, use the Primary API key or enable Upload permission for key ${env('CLOUDINARY_API_KEY')}.`;
  }

  return httpCode ? `Cloudinary error ${httpCode}: ${message}` : message;
}

export async function uploadProductImage(multerFile) {
  if (!multerFile) throw new Error('No file provided');

  if (!isCloudinaryConfigured()) {
    if (process.env.VERCEL) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel.');
    }
    const prepared = prepareUploadFile(multerFile);
    return `/uploads/products/${multerFile.filename || 'local-image.jpg'}`;
  }

  const prepared = prepareUploadFile(multerFile);
  const { path, size, cleanup } = prepared;

  if (!existsSync(path)) {
    throw new Error(`Upload file not found: ${path}`);
  }

  const fileStat = statSync(path);
  if (fileStat.size === 0 || size === 0) {
    cleanup();
    throw new Error('Uploaded file is empty');
  }

  configureCloudinary();

  try {
    const result = await cloudinary.uploader.upload(path, {
      folder: 'thahirs/products',
      resource_type: 'image',
    });

    if (!result?.secure_url) {
      throw new Error('Cloudinary upload succeeded but no secure_url was returned');
    }

    return result.secure_url;
  } catch (err) {
    console.error('[cloudinary] Upload failed:', formatCloudinaryError(err));
    throw new Error(formatCloudinaryError(err));
  } finally {
    cleanup();
    if (multerFile.path && multerFile.path !== path) {
      try { unlinkSync(multerFile.path); } catch { /* ignore */ }
    }
  }
}

export async function verifyCloudinaryConnection() {
  configureCloudinary();
  return cloudinary.api.ping();
}
