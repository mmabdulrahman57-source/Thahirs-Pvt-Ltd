import { fileURLToPath } from 'url';
import { createApp } from './app.js';

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const app = await createApp();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`THAHIRS API running on http://localhost:${PORT}`);
  });
}
