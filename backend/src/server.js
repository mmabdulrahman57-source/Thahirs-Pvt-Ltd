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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) cb(null, true);
    else cb(null, process.env.FRONTEND_URL || 'http://localhost:5173');
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_ROOT));

app.get('/api/health', (_, res) => res.json({ status: 'ok', company: 'THAHIRS (PVT) LTD' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', contentRoutes);

await initStore();
await seedIfEmpty();

app.listen(PORT, () => {
  console.log(`THAHIRS API running on http://localhost:${PORT}`);
});
