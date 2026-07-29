import '../env.js';
import { v2 as cloudinary } from 'cloudinary';
import { existsSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { prepareUploadFile } from './upload.js';

function env(name) {
  return process.env[name]?.trim() || '';
}

function resolveCredentials() {
  const explicit = {
    cloud_name: env('CLOUDINARY_CLOUD_NAME'),
    api_key: env('CLOUDINARY_API_KEY'),
    api_secret: env('CLOUDINARY_API_SECRET'),
  };

  if (explicit.cloud_name && explicit.api_key && explicit.api_secret) {
    // Prefer explicit vars — ignore stale CLOUDINARY_URL from Vercel cache
    if (process.env.CLOUDINARY_URL) {
      delete process.env.CLOUDINARY_URL;
    }
    return { source: 'env_vars', ...explicit };
  }

  const url = env('CLOUDINARY_URL');
  if (url) {
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?]+)/);
    if (match) {
      return {
        source: 'CLOUDINARY_URL',
        api_key: decodeURIComponent(match[1]),
        api_secret: decodeURIComponent(match[2]),
        cloud_name: match[3],
      };
    }
  }

  return { source: 'none', cloud_name: '', api_key: '', api_secret: '' };
}

export function validateCloudinaryApiKey(apiKey) {
  if (!apiKey) return { valid: false, reason: 'CLOUDINARY_API_KEY is not set' };
  return { valid: true };
}

export function isCloudinaryConfigured() {
  const creds = resolveCredentials();
  return Boolean(creds.cloud_name && creds.api_key && creds.api_secret);
}

/**
 * Official Cloudinary Node SDK only — no manual signatures, presets, or fetch uploads.
 * Prefer explicit env vars over CLOUDINARY_URL to avoid stale cached URLs on Vercel.
 */
export function configureCloudinary() {
  const creds = resolveCredentials();

  if (!creds.api_key || !creds.api_secret || !creds.cloud_name) {
    throw new Error('Cloudinary is not configured');
  }

  cloudinary.config({
    cloud_name: creds.cloud_name,
    api_key: creds.api_key,
    api_secret: creds.api_secret,
    secure: true,
  });

  return creds;
}

export function getCloudinaryStatus() {
  const creds = resolveCredentials();
  const validation = validateCloudinaryApiKey(creds.api_key);
  return {
    configured: isCloudinaryConfigured(),
    source: creds.source,
    cloudName: creds.cloud_name || null,
    apiKey: creds.api_key || null,
    hasApiSecret: Boolean(creds.api_secret),
    keyValid: validation.valid,
    keyWarning: validation.valid ? null : validation.reason,
  };
}

/** Log loaded API key at startup (never logs secret) */
export function logCloudinaryStartup() {
  const status = getCloudinaryStatus();
  console.log('[cloudinary] Startup configuration:', {
    source: status.source,
    cloudName: status.cloudName,
    apiKey: status.apiKey,
    hasApiSecret: status.hasApiSecret,
  });

  if (status.keyWarning) {
    console.error('[cloudinary] API key issue:', status.keyWarning);
  }

  return status;
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
  const creds = resolveCredentials();
  const validation = validateCloudinaryApiKey(creds.api_key);

  if (!validation.valid) {
    const error = new Error(validation.reason);
    error.httpCode = 503;
    return error;
  }

  if (httpCode === 403) {
    const error = new Error(
      `Ping succeeds but upload is denied for API key ${creds.api_key}. Enable Upload permission for this key in Cloudinary Dashboard → Settings → Access Keys.`
    );
    error.httpCode = 403;
    error.cloudinary = { apiKey: creds.api_key, cloudName: creds.cloud_name };
    return error;
  }

  const error = new Error(httpCode ? `Cloudinary error ${httpCode}: ${message}` : message);
  error.httpCode = httpCode || 502;
  return error;
}

export async function verifyCloudinaryConnection() {
  configureCloudinary();
  return cloudinary.api.ping();
}

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
      } catch { /* ignore */ }
    }
  } catch (err) {
    const details = logCloudinaryError('upload', err);
    upload = { ok: false, error: formatCloudinaryError(err).message, details };
  } finally {
    try { unlinkSync(testPath); } catch { /* ignore */ }
  }

  return { ...status, ping: ping ?? pingError, upload };
}

export async function uploadImage(multerFile, { folder = 'thahirs/products' } = {}) {
  if (!multerFile) throw new Error('No file provided');

  if (!isCloudinaryConfigured()) {
    throw new Error(
      process.env.VERCEL
        ? 'Cloudinary is not configured on Vercel. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET with Upload permission enabled.'
        : 'Cloudinary is not configured. Set CLOUDINARY_* environment variables.'
    );
  }

  const creds = configureCloudinary();
  const validation = validateCloudinaryApiKey(creds.api_key);
  if (!validation.valid) {
    throw new Error(validation.reason);
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

  console.log('[cloudinary] Uploading via SDK uploader.upload():', {
    path,
    size: fileStat.size,
    cloudName: creds.cloud_name,
    apiKey: creds.api_key,
    folder,
  });

  try {
    const result = await cloudinary.uploader.upload(path, {
      folder,
      resource_type: 'image',
    });

    if (!result?.secure_url) {
      throw new Error('Cloudinary upload succeeded but no secure_url was returned');
    }

    console.log('[cloudinary] Upload OK:', result.public_id);
    return result.secure_url;
  } catch (err) {
    logCloudinaryError('uploadImage', err);
    throw formatCloudinaryError(err);
  } finally {
    cleanup();
    if (multerFile.path && multerFile.path !== path) {
      try { unlinkSync(multerFile.path); } catch { /* ignore */ }
    }
  }
}

/** @deprecated Use uploadImage */
export async function uploadProductImage(multerFile) {
  return uploadImage(multerFile, { folder: 'thahirs/products' });
}
