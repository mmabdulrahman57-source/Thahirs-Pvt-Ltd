import './env.js';
import { disconnectDB } from './db.js';
import { initStore } from './jsonStore.js';
import { seedIfEmpty } from './seedData.js';
import { runDailyBackup } from './utils/backup.js';

async function seed() {
  await initStore();
  await seedIfEmpty();
  await disconnectDB();
  console.log('Seed complete!');
  process.exit(0);
}

if (process.argv.includes('--daily-backup')) {
  runDailyBackup()
    .then(() => { console.log('Daily backup complete'); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
} else {
  seed().catch((err) => { console.error(err); process.exit(1); });
}
