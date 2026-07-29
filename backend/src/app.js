import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import quotationRoutes from './routes/quotations.js';
import messageRoutes from './routes/messages.js';
import contentRoutes from './routes/content.js';
import adminRoutes from './routes/admin.js';
import { seedIfEmpty } from './seedData.js';
import { initStore, isStoreReady, getStoreError } from './jsonStore.js';
import { UPLOAD_ROOT } from './utils/upload.js';
import { getDatabaseStatus, healthCheck } from './db.js';
import { hasDatabaseUrl } from './utils/dbUrl.js';
import { getCloudinaryStatus } from './utils/cloudinary.js';

dotenv.config();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {
    // ignore invalid origin URLs
  }

  const allowed = [
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter(Boolean);

  return allowed.some(url => origin === url || origin.startsWith(String(url).replace(/\/$/, '')));
}

export async function createApp() {
  const app = express();

  app.use(cors({
    origin: (origin, cb) => {
      cb(null, isAllowedOrigin(origin));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(UPLOAD_ROOT));

  app.get('/api/health', async (_, res) => {
    const dbStatus = getDatabaseStatus();
    const cloudStatus = getCloudinaryStatus();
    const payload = {
      status: 'ok',
      company: 'THAHIRS (PVT) LTD',
      storeReady: isStoreReady(),
      database: isStoreReady() ? 'mysql' : (hasDatabaseUrl() ? 'disconnected' : 'json-fallback'),
      cloudinary: cloudStatus,
      ...dbStatus,
      storeError: getStoreError(),
    };

    if (!isStoreReady() && hasDatabaseUrl()) {
      return res.status(503).json({
        ...payload,
        status: 'degraded',
        hint: 'Check DATABASE_URL — use MYSQL_ADDON_URI from Clever Cloud. SSL uses accept_invalid_certs automatically.',
      });
    }

    try {
      const check = await healthCheck();
      return res.json({ ...payload, userCount: check.userCount });
    } catch (err) {
      console.error('[health] Database check failed:', err.message);
      return res.status(503).json({
        ...payload,
        status: 'degraded',
        error: err.message,
      });
    }
  });

  try {
    await initStore();
    await seedIfEmpty();
  } catch (err) {
    console.error('[app] Startup store/seed failed:', err.message);
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/quotations', quotationRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', contentRoutes);

  app.use((err, req, res, _next) => {
    console.error(`[api] ${req.method} ${req.path}:`, err.message);
    if (!res.headersSent) {
      res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
      });
    }
  });

  return app;
}
