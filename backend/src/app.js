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
import { initStore } from './jsonStore.js';
import { UPLOAD_ROOT } from './utils/upload.js';

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
    try {
      const { healthCheck } = await import('./db.js');
      await healthCheck();
      res.json({ status: 'ok', company: 'THAHIRS (PVT) LTD', database: 'mysql' });
    } catch {
      res.json({ status: 'ok', company: 'THAHIRS (PVT) LTD', database: 'json-fallback' });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/quotations', quotationRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', contentRoutes);

  await initStore();
  await seedIfEmpty();

  return app;
}
