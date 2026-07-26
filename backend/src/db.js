import mongoose from 'mongoose';

export async function connectDB() {
  const srvUri = process.env.MONGODB_URI;
  const standardUri = process.env.MONGODB_URI_STANDARD;
  const uris = [srvUri, standardUri].filter(Boolean);

  if (!uris.length) {
    throw new Error('MONGODB_URI is not set in backend/.env');
  }

  let lastError;
  for (const uri of uris) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
      console.log('MongoDB connected');
      return;
    } catch (err) {
      lastError = err;
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }
      console.warn(`MongoDB connect attempt failed (${uri.startsWith('mongodb+srv') ? 'SRV' : 'standard'}):`, err.message);
    }
  }

  throw lastError;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
