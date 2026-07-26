import mongoose from 'mongoose';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { connectDB } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = join(__dirname, '../../data');
export const DB_FILE = join(DATA_DIR, 'db.json');

const ARRAY_KEYS = [
  'users', 'categories', 'brands', 'products', 'quotations', 'messages',
  'team', 'gallery', 'projects', 'testimonials', 'faqs', 'newsletter',
  'downloads', 'notifications', 'activityLogs',
];

const defaultDb = {
  users: [],
  categories: [],
  brands: [],
  products: [],
  quotations: [],
  messages: [],
  team: [],
  gallery: [],
  projects: [],
  testimonials: [],
  faqs: [],
  newsletter: [],
  downloads: [],
  notifications: [],
  activityLogs: [],
  analytics: { visitors: [], pageViews: [], dailyStats: [] },
  settings: {},
  cms: {},
};

const models = {};
const metaModel = (() => {
  const schema = new mongoose.Schema({
    _id: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  }, { collection: 'appmeta', versionKey: false });
  return mongoose.models.AppMeta || mongoose.model('AppMeta', schema);
})();

function getModel(collection) {
  if (!models[collection]) {
    const schema = new mongoose.Schema({}, { strict: false, timestamps: true, versionKey: false, collection });
    schema.add({ _id: { type: String, default: () => randomUUID() } });
    models[collection] = mongoose.models[collection] || mongoose.model(collection, schema, collection);
  }
  return models[collection];
}

let cache = structuredClone(defaultDb);
let initialized = false;

function toPlain(doc) {
  if (!doc) return doc;
  const plain = { ...doc };
  if (plain._id) plain._id = String(plain._id);
  if (plain.createdAt instanceof Date) plain.createdAt = plain.createdAt.toISOString();
  if (plain.updatedAt instanceof Date) plain.updatedAt = plain.updatedAt.toISOString();
  return plain;
}

function persistDoc(collection, doc) {
  if (!initialized) return;
  getModel(collection).replaceOne({ _id: doc._id }, doc, { upsert: true }).catch(err => {
    console.error(`Mongo persist failed (${collection}/${doc._id}):`, err.message);
  });
}

function persistDelete(collection, id) {
  if (!initialized) return;
  getModel(collection).deleteOne({ _id: id }).catch(err => {
    console.error(`Mongo delete failed (${collection}/${id}):`, err.message);
  });
}

function persistMeta(key, data) {
  if (!initialized) return;
  metaModel.replaceOne({ _id: key }, { _id: key, data }, { upsert: true }).catch(err => {
    console.error(`Mongo meta persist failed (${key}):`, err.message);
  });
}

async function loadFromMongo() {
  for (const name of ARRAY_KEYS) {
    const docs = await getModel(name).find().lean();
    cache[name] = docs.map(toPlain);
  }
  for (const key of ['settings', 'cms', 'analytics']) {
    const meta = await metaModel.findById(key).lean();
    cache[key] = meta?.data ?? defaultDb[key];
  }
}

async function persistAll() {
  for (const name of ARRAY_KEYS) {
    const Model = getModel(name);
    await Model.deleteMany({});
    if (cache[name]?.length) await Model.insertMany(cache[name]);
  }
  for (const key of ['settings', 'cms', 'analytics']) {
    await metaModel.replaceOne({ _id: key }, { _id: key, data: cache[key] }, { upsert: true });
  }
}

function saveLocalFile() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
}

function touchCache() {
  if (!initialized) saveLocalFile();
}

function importFromJsonFile() {
  if (!existsSync(DB_FILE)) return false;
  const db = JSON.parse(readFileSync(DB_FILE, 'utf8'));
  Object.keys(defaultDb).forEach(k => { cache[k] = db[k] ?? defaultDb[k]; });
  return true;
}

export async function initStore() {
  if (initialized) return;

  try {
    await connectDB();
    await loadFromMongo();

    const isEmpty = cache.users.length === 0 && cache.products.length === 0;
    if (isEmpty && importFromJsonFile()) {
      console.log('Importing existing db.json into MongoDB...');
      await persistAll();
      console.log('db.json imported to MongoDB');
    }

    initialized = true;
    console.log('Using MongoDB Atlas for data storage');
  } catch (err) {
    console.warn('MongoDB connection failed — falling back to local db.json');
    console.warn(err.message);
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (importFromJsonFile()) {
      console.log('Loaded data from db.json');
    } else {
      cache = structuredClone(defaultDb);
    }
    initialized = false;
  }
}

export class Collection {
  constructor(name) {
    this.name = name;
  }

  find(filter = {}) {
    let items = [...(cache[this.name] || [])];
    if (filter._id && filter._id.$ne) items = items.filter(i => i._id !== filter._id.$ne);
    if (filter.category) items = items.filter(i => i.category === filter.category || i.category?._id === filter.category);
    if (filter.brand) items = items.filter(i => i.brand === filter.brand || i.brand?._id === filter.brand);
    if (filter.featured !== undefined) items = items.filter(i => i.featured === filter.featured);
    if (filter.read === false) items = items.filter(i => !i.read);
    if (filter.read === true) items = items.filter(i => i.read);
    if (filter.status) items = items.filter(i => i.status === filter.status);
    if (filter.userId) items = items.filter(i => i.userId === filter.userId);
    if (filter.role) items = items.filter(i => i.role === filter.role);
    if (filter.active !== undefined) items = items.filter(i => (i.active !== false) === filter.active || i.active === filter.active);
    if (filter.archived) items = items.filter(i => i.archived === true);
    if (filter.archived === false) items = items.filter(i => !i.archived);
    if (filter.customerEmail) items = items.filter(i => i.customer?.email === filter.customerEmail);
    if (filter.$or) {
      const q = filter.$or;
      items = items.filter(i => q.some(f => {
        if (f.name?.$regex) return new RegExp(f.name.$regex, f.name.$options || 'i').test(i.name || '');
        if (f.email?.$regex) return new RegExp(f.email.$regex, f.email.$options || 'i').test(i.email || '');
        if (f.description?.$regex) return new RegExp(f.description.$regex, f.description.$options || 'i').test(i.description || '');
        if (f.tags?.$regex) return (i.tags || []).some(t => new RegExp(f.tags.$regex, f.tags.$options || 'i').test(t));
        return false;
      }));
    }
    return items;
  }

  findOne(query) {
    const items = this.find();
    if (query._id) return items.find(i => i._id === query._id) || null;
    if (query.slug) return items.find(i => i.slug === query.slug) || null;
    if (query.email) return items.find(i => i.email === query.email) || null;
    if (query.reference) return items.find(i => i.reference === query.reference) || null;
    if (query.key) return items.find(i => i.key === query.key) || null;
    return null;
  }

  countDocuments(filter = {}) {
    return this.find(filter).length;
  }

  insertMany(docs) {
    const withIds = docs.map(d => ({
      ...d,
      _id: d._id || randomUUID(),
      createdAt: d.createdAt || new Date().toISOString(),
    }));
    cache[this.name] = [...(cache[this.name] || []), ...withIds];
    withIds.forEach(doc => persistDoc(this.name, doc));
    touchCache();
    return withIds;
  }

  create(doc) {
    return this.insertMany([doc])[0];
  }

  findByIdAndUpdate(id, data, opts = {}) {
    const idx = (cache[this.name] || []).findIndex(i => i._id === id);
    if (idx === -1) return null;
    cache[this.name][idx] = { ...cache[this.name][idx], ...data, updatedAt: new Date().toISOString() };
    persistDoc(this.name, cache[this.name][idx]);
    touchCache();
    return opts.new !== false ? cache[this.name][idx] : cache[this.name][idx];
  }

  findByIdAndDelete(id) {
    const item = (cache[this.name] || []).find(i => i._id === id);
    cache[this.name] = (cache[this.name] || []).filter(i => i._id !== id);
    if (item) persistDelete(this.name, id);
    touchCache();
    return item;
  }

  deleteMany() {
    const ids = (cache[this.name] || []).map(i => i._id);
    cache[this.name] = [];
    if (initialized) {
      getModel(this.name).deleteMany({}).catch(err => console.error(`Mongo deleteMany failed (${this.name}):`, err.message));
    }
    touchCache();
    return { deletedCount: ids.length };
  }
}

export const User = new Collection('users');
export const Category = new Collection('categories');
export const Brand = new Collection('brands');
export const Product = new Collection('products');
export const Quotation = new Collection('quotations');
export const Message = new Collection('messages');
export const TeamMember = new Collection('team');
export const Gallery = new Collection('gallery');
export const Project = new Collection('projects');
export const Testimonial = new Collection('testimonials');
export const Faq = new Collection('faqs');
export const Newsletter = new Collection('newsletter');
export const Download = new Collection('downloads');
export const Notification = new Collection('notifications');
export const ActivityLog = new Collection('activityLogs');

export function getSettings() {
  return cache.settings || {};
}

export function saveSettings(data) {
  cache.settings = { ...cache.settings, ...data, updatedAt: new Date().toISOString() };
  persistMeta('settings', cache.settings);
  touchCache();
  return cache.settings;
}

export function getCms() {
  return cache.cms || {};
}

export function saveCms(data) {
  cache.cms = { ...cache.cms, ...data, updatedAt: new Date().toISOString() };
  persistMeta('cms', cache.cms);
  touchCache();
  return cache.cms;
}

export function getAnalytics() {
  return cache.analytics || { visitors: [], pageViews: [], dailyStats: [] };
}

export function saveAnalytics(data) {
  cache.analytics = { ...cache.analytics, ...data };
  persistMeta('analytics', cache.analytics);
  touchCache();
  return cache.analytics;
}

export function populate(items, fields) {
  return items.map(item => {
    const copy = { ...item };
    if (fields.includes('category') && item.category) {
      copy.category = cache.categories.find(c => c._id === item.category) || item.category;
    }
    if (fields.includes('brand') && item.brand) {
      copy.brand = cache.brands.find(b => b._id === item.brand) || item.brand;
    }
    return copy;
  });
}

export function resetDb() {
  cache = structuredClone(defaultDb);
  if (initialized) {
    Promise.all([
      ...ARRAY_KEYS.map(name => getModel(name).deleteMany({})),
      metaModel.deleteMany({}),
    ]).catch(err => console.error('Mongo reset failed:', err.message));
  }
  touchCache();
}

export function backupDb() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const backupPath = join(DATA_DIR, `backup-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(cache, null, 2));
  if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
  else copyFileSync(DB_FILE, join(DATA_DIR, `db-snapshot-${Date.now()}.json`));
  writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
  return backupPath;
}

export function restoreDb(fromPath) {
  if (!existsSync(fromPath)) throw new Error('Backup file not found');
  cache = JSON.parse(readFileSync(fromPath, 'utf8'));
  Object.keys(defaultDb).forEach(k => { if (!cache[k]) cache[k] = defaultDb[k]; });
  if (initialized) {
    persistAll().catch(err => console.error('Mongo restore failed:', err.message));
  }
}

export function load() {
  return cache;
}

export function save(db) {
  cache = { ...cache, ...db };
  if (initialized) {
    persistAll().catch(err => console.error('Mongo save failed:', err.message));
  }
}
