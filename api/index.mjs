import { createApp } from '../backend/src/app.js';

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = createApp().catch((err) => {
      appPromise = undefined;
      console.error('Failed to initialize Express app:', err);
      throw err;
    });
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('[vercel] API error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({
        message: err.message || 'Server error',
      });
    }
  }
}
