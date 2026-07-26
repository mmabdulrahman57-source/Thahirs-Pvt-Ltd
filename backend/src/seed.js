import dotenv from 'dotenv';
import { disconnectDB } from './db.js';
import { initStore } from './jsonStore.js';
import { seedIfEmpty } from './seedData.js';

dotenv.config();

async function seed() {
  await initStore();
  await seedIfEmpty();
  await disconnectDB();
  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
