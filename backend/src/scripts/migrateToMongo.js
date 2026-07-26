/**
 * One-time script: push all local db.json data into MongoDB Atlas.
 * Run from backend folder: npm run migrate
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../db.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = join(__dirname, '../../../data/db.json');

const ARRAY_KEYS = [
  'users', 'categories', 'brands', 'products', 'quotations', 'messages',
  'team', 'gallery', 'projects', 'testimonials', 'faqs', 'newsletter',
  'downloads', 'notifications', 'activityLogs',
];

const defaultDb = {
  users: [], categories: [], brands: [], products: [], quotations: [],
  messages: [], team: [], gallery: [], projects: [], testimonials: [],
  faqs: [], newsletter: [], downloads: [], notifications: [], activityLogs: [],
  analytics: { visitors: [], pageViews: [], dailyStats: [] },
  settings: {}, cms: {},
};

function loadData() {
  if (!existsSync(DB_FILE)) {
    console.log('No db.json found — will seed fresh data into MongoDB via npm run seed');
    return null;
  }
  const db = JSON.parse(readFileSync(DB_FILE, 'utf8'));
  Object.keys(defaultDb).forEach(k => { if (!db[k]) db[k] = defaultDb[k]; });
  return db;
}

function getModel(name) {
  if (mongoose.models[`migrate_${name}`]) return mongoose.models[`migrate_${name}`];
  const schema = new mongoose.Schema({}, { strict: false, versionKey: false, collection: name });
  schema.add({ _id: { type: String } });
  return mongoose.model(`migrate_${name}`, schema, name);
}

const metaSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { collection: 'appmeta', versionKey: false });
const AppMeta = mongoose.models.MigrateAppMeta || mongoose.model('MigrateAppMeta', metaSchema);

async function migrate() {
  console.log('Connecting to MongoDB Atlas...');
  await connectDB();
  console.log('Connected!\n');

  const data = loadData();
  if (!data) {
    console.log('Run "npm run seed" after this to populate MongoDB with default data.');
    await disconnectDB();
    return;
  }

  let total = 0;
  for (const name of ARRAY_KEYS) {
    const items = data[name] || [];
    if (!items.length) continue;
    const Model = getModel(name);
    await Model.deleteMany({});
    await Model.insertMany(items);
    console.log(`  ${name}: ${items.length} documents`);
    total += items.length;
  }

  for (const key of ['settings', 'cms', 'analytics']) {
    await AppMeta.replaceOne({ _id: key }, { _id: key, data: data[key] ?? defaultDb[key] }, { upsert: true });
    console.log(`  appmeta/${key}: saved`);
  }

  console.log(`\nDone! ${total} records migrated to MongoDB Atlas.`);
  console.log('Restart the backend: npm run dev');
  await disconnectDB();
}

migrate().catch(err => {
  console.error('\nMigration failed:', err.message);
  if (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED')) {
    console.error(`
Atlas connection blocked. Please do these steps in MongoDB Atlas:

1. Network Access → Add IP Address → "Add Current IP Address" (or 0.0.0.0/0 for testing)
2. Database Access → confirm user mmabdulrahman57_db_user exists and password is correct
3. If SRV fails, use Standard connection string from Atlas (not mongodb+srv)
4. Update MONGODB_URI in backend/.env and run: npm run migrate
`);
  }
  process.exit(1);
});
