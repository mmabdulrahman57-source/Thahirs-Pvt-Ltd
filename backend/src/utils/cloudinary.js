import { v2 as cloudinary } from 'cloudinary';
import { existsSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { prepareUploadFile } from './upload.js';

function env(name) {
  return process.env[name]?.trim() || '';
}

export function isCloudinaryConfigured() {
  if (env('CLOUDINARY_URL')) return true;
  return Boolean(
    env('CLOUDINARY_CLOUD_NAME') &&
    env('CLOUDINARY_API_KEY') &&
    env('CLOUDINARY_API_SECRET')
  );
}

/**
 * Official Cloudinary Node SDK configuration only.
 * Supports CLOUDINARY_URL or separate env vars — no manual signatures.
 */
export function configureCloudinary() {
  const cloudinaryUrl = env('CLOUDINARY_URL');
  if (cloudinaryUrl) {
    process.env.CLOUDINARY_URL = cloudinaryUrl;
    cloudinary.config({ secure: true });
    return;
  }

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
    usingUrl: Boolean(env('CLOUDINARY_URL')),
    cloudName: env('CLOUDINARY_CLOUD_NAME') || null,
    apiKey: env('CLOUDINARY_API_KEY') || null,
    hasApiSecret: Boolean(env('CLOUDINARY_API_SECRET')),
  };
}

function logCloudinaryError(context, err) {
  const details = {
    context,
    http_code: err?.http_code ?? err?.error?.http_code ?? null,
    message: err?.message ?? err?.error?.message ?? String(err),
    name: err?.name ?? null,
    error: err?.error ?? null,
  };
  console.error('[cloudinary] Error details:', JSON.stringify(details, null, 2));
  return details;
}

function formatCloudinaryError(err) {
  const httpCode = err?.http_code ?? err?.error?.http_code;
  const message = err?.message ?? err?.error?.message ?? String(err);

  if (httpCode === 403) {
    return `Cloudinary upload forbidden (403). Ping succeeds but upload is denied for API key ${env('CLOUDINARY_API_KEY')}. Use the Primary API key in Cloudinary Dashboard → Settings → Access Keys, or enable Upload permission on this key.`;
  }

  return httpCode ? `Cloudinary error ${httpCode}: ${message}` : message;
}

export async function verifyCloudinaryConnection() {
  configureCloudinary();
  return cloudinary.api.ping();
}

/** Run ping + tiny upload test for production diagnostics */
export async function runCloudinaryDiagnostics() {
  const status = getCloudinaryStatus();
  if (!status.configured) {
    return { ...status, ping: null, upload: { ok: false, error: 'Cloudinary not configured' } };
  }

  configureCloudinary();

  let ping = null;
  let pingError = null;
  try {
    ping = await cloudinary.api.ping();
  } catch (err) {
    pingError = logCloudinaryError('ping', err);
  }

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  const testPath = join(tmpdir(), `cloudinary-diagnostic-${Date.now()}.png`);
  writeFileSync(testPath, png);

  let upload = { ok: false };
  try {
    const result = await cloudinary.uploader.upload(testPath, {
      folder: 'thahirs/products',
      resource_type: 'image',
    });
    upload = { ok: true, url: result.secure_url, public_id: result.public_id };
    if (result.public_id) {
      try {
        await cloudinary.uploader.destroy(result.public_id, { resource_type: 'image' });
      } catch { /* ignore cleanup failure */ }
    }
  } catch (err) {
    const details = logCloudinaryError('upload', err);
    upload = { ok: false, error: formatCloudinaryError(err), details };
  } finally {
    try { unlinkSync(testPath); } catch { /* ignore */ }
  }

  return { ...status, ping: ping ?? pingError, upload };
}

export async function uploadProductImage(multerFile) {
  if (!multerFile) throw new Error('No file provided');

  if (!isCloudinaryConfigured()) {
    if (process.env.VERCEL) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET in Vercel.');
    }
    return `/uploads/products/${multerFile.filename || 'local-image.jpg'}`;
  }

  const { path, size, cleanup } = prepareUploadFile(multerFile);

  if (!existsSync(path)) {
    throw new Error(`Upload file not found: ${path}`);
  }

  const fileStat = statSync(path);
  if (fileStat.size === 0 || size === 0) {
    cleanup();
    throw new Error('Uploaded file is empty');
  }

  configureCloudinary();

  console.log('[cloudinary] Uploading via SDK:', {
    path,
    size: fileStat.size,
    cloud: env('CLOUDINARY_CLOUD_NAME'),
    apiKey: env('CLOUDINARY_API_KEY'),
  });

  try {
    const result = await cloudinary.uploader.upload(path, {
      folder: 'thahirs/products',
      resource_type: 'image',
    });

    if (!result?.secure_url) {
      throw new Error('Cloudinary upload succeeded but no secure_url was returned');
    }

    console.log('[cloudinary] Upload OK:', result.public_id);
    return result.secure_url;
  } catch (err) {
    logCloudinaryError('uploadProductImage', err);
    throw new Error(formatCloudinaryError(err));
  } finally {
    cleanup();
    if (multerFile.path && multerFile.path !== path) {
      try { unlinkSync(multerFile.path); } catch { /* ignore */ }
    }
  }
}
