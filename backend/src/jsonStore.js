import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { connectDB, prisma, setDatabaseError } from './db.js';
import { hasDatabaseUrl } from './utils/dbUrl.js';
import { ensureDir, isServerless, serverlessPath } from './utils/serverless.js';
import {
  userToCache, userFromCache,
  categoryToCache, categoryFromCache,
  brandToCache, brandFromCache,
  productToCache, productFromCache,
  quotationToCache, quotationFromCache, quotationItemFromCache, quotationItemsFromCache,
  messageToCache, messageFromCache,
  teamToCache, teamFromCache,
  galleryToCache, galleryFromCache,
  projectToCache, projectFromCache,
  testimonialToCache, testimonialFromCache,
  faqToCache, faqFromCache,
  newsletterToCache, newsletterFromCache,
  downloadToCache, downloadFromCache,
  notificationToCache, notificationFromCache,
  activityToCache, activityFromCache,
} from './storeMappers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = isServerless
  ? serverlessPath('thahirs-data')
  : join(__dirname, '../../data');
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

let cache = structuredClone(defaultDb);
let initialized = false;
let initError = null;
let initPromise = null;

export function isStoreReady() {
  return initialized;
}

export function getStoreError() {
  return initError?.message || null;
}

/** Ensure MySQL store is ready — retries connection on serverless cold starts */
export async function ensureStoreReady() {
  if (initialized) return true;
  if (!hasDatabaseUrl()) return false;

  if (!initPromise) {
    initPromise = initStore().finally(() => {
      initPromise = null;
    });
  }

  await initPromise;
  return initialized;
}

function saveLocalFile() {
  try {
    ensureDir(DATA_DIR);
    writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn('Could not persist local db.json:', err.message);
  }
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

async function loadSettingsFromDb() {
  let row = await prisma.websiteSettings.findUnique({ where: { id: 'main' } });
  if (!row) {
    row = await prisma.websiteSettings.create({ data: { id: 'main' } });
  }
  cache.settings = row.settingsJson || {};
  cache.cms = row.cmsJson || {};
  cache.analytics = row.analyticsJson || defaultDb.analytics;
}

async function loadFromMySQL() {
  const [
    users, categories, brands, products, productImages, quotations, quotationItems,
    messages, team, gallery, projects, testimonials, faqs, newsletter, downloads, notifications, activityLogs,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.category.findMany(),
    prisma.brand.findMany(),
    prisma.product.findMany(),
    prisma.productImage.findMany(),
    prisma.quotation.findMany(),
    prisma.quotationItem.findMany(),
    prisma.message.findMany(),
    prisma.teamMember.findMany(),
    prisma.gallery.findMany(),
    prisma.project.findMany(),
    prisma.testimonial.findMany(),
    prisma.faq.findMany(),
    prisma.newsletter.findMany(),
    prisma.download.findMany(),
    prisma.notification.findMany(),
    prisma.activityLog.findMany(),
  ]);

  const imagesByProduct = productImages.reduce((acc, img) => {
    (acc[img.productId] ||= []).push(img);
    return acc;
  }, {});

  const itemsByQuotation = quotationItems.reduce((acc, item) => {
    (acc[item.quotationId] ||= []).push(item);
    return acc;
  }, {});

  cache.users = users.map(userToCache);
  cache.categories = categories.map(categoryToCache);
  cache.brands = brands.map(brandToCache);
  cache.products = products.map(p => productToCache(p, imagesByProduct[p.id] || []));
  cache.quotations = quotations.map(q => quotationToCache(q, itemsByQuotation[q.id] || []));
  cache.messages = messages.map(messageToCache);
  cache.team = team.map(teamToCache);
  cache.gallery = gallery.map(galleryToCache);
  cache.projects = projects.map(projectToCache);
  cache.testimonials = testimonials.map(testimonialToCache);
  cache.faqs = faqs.map(faqToCache);
  cache.newsletter = newsletter.map(newsletterToCache);
  cache.downloads = downloads.map(downloadToCache);
  cache.notifications = notifications.map(notificationToCache);
  cache.activityLogs = activityLogs.map(activityToCache);

  await loadSettingsFromDb();
}

async function persistAllToMySQL() {
  await prisma.$transaction(async (tx) => {
    await tx.quotationItem.deleteMany();
    await tx.quotation.deleteMany();
    await tx.productImage.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();
    await tx.brand.deleteMany();
    await tx.user.deleteMany();
    await tx.message.deleteMany();
    await tx.teamMember.deleteMany();
    await tx.gallery.deleteMany();
    await tx.project.deleteMany();
    await tx.testimonial.deleteMany();
    await tx.faq.deleteMany();
    await tx.newsletter.deleteMany();
    await tx.download.deleteMany();
    await tx.notification.deleteMany();
    await tx.activityLog.deleteMany();

    for (const doc of cache.users) {
      await tx.user.create({ data: userFromCache(doc) });
    }
    for (const doc of cache.categories) {
      await tx.category.create({ data: categoryFromCache(doc) });
    }
    for (const doc of cache.brands) {
      await tx.brand.create({ data: brandFromCache(doc) });
    }
    for (const doc of cache.products) {
      const data = productFromCache(doc);
      const images = doc.images || [];
      await tx.product.create({
        data: {
          ...data,
          images: images.length ? {
            create: images.map(url => ({ imageUrl: url })),
          } : undefined,
        },
      });
    }
    for (const doc of cache.quotations) {
      const qData = quotationFromCache(doc);
      const items = quotationItemsFromCache(doc);
      await tx.quotation.create({
        data: {
          ...qData,
          items: items?.length ? {
            create: items.map(item => {
              const mapped = quotationItemFromCache(item, doc._id);
              const { id, quotationId, ...rest } = mapped;
              return rest;
            }),
          } : undefined,
        },
      });
    }
    for (const doc of cache.messages) await tx.message.create({ data: messageFromCache(doc) });
    for (const doc of cache.team) await tx.teamMember.create({ data: teamFromCache(doc) });
    for (const doc of cache.gallery) await tx.gallery.create({ data: galleryFromCache(doc) });
    for (const doc of cache.projects) await tx.project.create({ data: projectFromCache(doc) });
    for (const doc of cache.testimonials) await tx.testimonial.create({ data: testimonialFromCache(doc) });
    for (const doc of cache.faqs) await tx.faq.create({ data: faqFromCache(doc) });
    for (const doc of cache.newsletter) await tx.newsletter.create({ data: newsletterFromCache(doc) });
    for (const doc of cache.downloads) await tx.download.create({ data: downloadFromCache(doc) });
    for (const doc of cache.notifications) await tx.notification.create({ data: notificationFromCache(doc) });
    for (const doc of cache.activityLogs) await tx.activityLog.create({ data: activityFromCache(doc) });
  });

  await persistSettings();
}

async function persistSettings() {
  if (!initialized) return;
  await prisma.websiteSettings.upsert({
    where: { id: 'main' },
    create: {
      id: 'main',
      settingsJson: cache.settings,
      cmsJson: cache.cms,
      analyticsJson: cache.analytics,
    },
    update: {
      settingsJson: cache.settings,
      cmsJson: cache.cms,
      analyticsJson: cache.analytics,
    },
  });
}

async function persistDoc(collection, doc) {
  if (hasDatabaseUrl()) {
    const ready = await ensureStoreReady();
    if (!ready) {
      const detail = getStoreError() || 'Database connection failed';
      throw new Error(`Database not initialized — cannot save data: ${detail}`);
    }
  } else if (!initialized) {
    return;
  }

  try {
    switch (collection) {
      case 'users':
        await prisma.user.upsert({ where: { id: doc._id }, create: userFromCache(doc), update: userFromCache(doc) });
        break;
      case 'categories':
        await prisma.category.upsert({ where: { id: doc._id }, create: categoryFromCache(doc), update: categoryFromCache(doc) });
        break;
      case 'brands':
        await prisma.brand.upsert({ where: { id: doc._id }, create: brandFromCache(doc), update: brandFromCache(doc) });
        break;
      case 'products': {
        const data = productFromCache(doc);
        await prisma.product.upsert({ where: { id: doc._id }, create: data, update: data });
        await prisma.productImage.deleteMany({ where: { productId: doc._id } });
        const images = doc.images || (doc.image ? [doc.image] : []);
        if (images.length) {
          await prisma.productImage.createMany({
            data: images.map(url => ({ productId: doc._id, imageUrl: url })),
          });
        }
        break;
      }
      case 'quotations': {
        const qData = quotationFromCache(doc);
        const items = quotationItemsFromCache(doc);
        await prisma.quotation.upsert({ where: { id: doc._id }, create: qData, update: qData });
        if (items) {
          await prisma.quotationItem.deleteMany({ where: { quotationId: doc._id } });
          for (const item of items) {
            const mapped = quotationItemFromCache(item, doc._id);
            await prisma.quotationItem.create({ data: mapped });
          }
        }
        break;
      }
      case 'messages':
        await prisma.message.upsert({ where: { id: doc._id }, create: messageFromCache(doc), update: messageFromCache(doc) });
        break;
      case 'team':
        await prisma.teamMember.upsert({ where: { id: doc._id }, create: teamFromCache(doc), update: teamFromCache(doc) });
        break;
      case 'gallery':
        await prisma.gallery.upsert({ where: { id: doc._id }, create: galleryFromCache(doc), update: galleryFromCache(doc) });
        break;
      case 'projects':
        await prisma.project.upsert({ where: { id: doc._id }, create: projectFromCache(doc), update: projectFromCache(doc) });
        break;
      case 'testimonials':
        await prisma.testimonial.upsert({ where: { id: doc._id }, create: testimonialFromCache(doc), update: testimonialFromCache(doc) });
        break;
      case 'faqs':
        await prisma.faq.upsert({ where: { id: doc._id }, create: faqFromCache(doc), update: faqFromCache(doc) });
        break;
      case 'newsletter':
        await prisma.newsletter.upsert({ where: { id: doc._id }, create: newsletterFromCache(doc), update: newsletterFromCache(doc) });
        break;
      case 'downloads':
        await prisma.download.upsert({ where: { id: doc._id }, create: downloadFromCache(doc), update: downloadFromCache(doc) });
        break;
      case 'notifications':
        await prisma.notification.upsert({ where: { id: doc._id }, create: notificationFromCache(doc), update: notificationFromCache(doc) });
        break;
      case 'activityLogs':
        await prisma.activityLog.upsert({ where: { id: doc._id }, create: activityFromCache(doc), update: activityFromCache(doc) });
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[db] MySQL persist failed (${collection}/${doc._id}):`, err.message);
    throw err;
  }
}

async function persistDelete(collection, id) {
  if (hasDatabaseUrl()) {
    const ready = await ensureStoreReady();
    if (!ready) {
      const detail = getStoreError() || 'Database connection failed';
      throw new Error(`Database not initialized — cannot delete data: ${detail}`);
    }
  } else if (!initialized) {
    return;
  }

  try {
    const deletes = {
      users: () => prisma.user.delete({ where: { id } }),
      categories: () => prisma.category.delete({ where: { id } }),
      brands: () => prisma.brand.delete({ where: { id } }),
      products: () => prisma.product.delete({ where: { id } }),
      quotations: () => prisma.quotation.delete({ where: { id } }),
      messages: () => prisma.message.delete({ where: { id } }),
      team: () => prisma.teamMember.delete({ where: { id } }),
      gallery: () => prisma.gallery.delete({ where: { id } }),
      projects: () => prisma.project.delete({ where: { id } }),
      testimonials: () => prisma.testimonial.delete({ where: { id } }),
      faqs: () => prisma.faq.delete({ where: { id } }),
      newsletter: () => prisma.newsletter.delete({ where: { id } }),
      downloads: () => prisma.download.delete({ where: { id } }),
      notifications: () => prisma.notification.delete({ where: { id } }),
      activityLogs: () => prisma.activityLog.delete({ where: { id } }),
    };
    if (deletes[collection]) await deletes[collection]();
  } catch (err) {
    console.error(`[db] MySQL delete failed (${collection}/${id}):`, err.message);
    throw err;
  }
}

export async function initStore() {
  if (initialized) return;

  try {
    await connectDB();
    await loadFromMySQL();

    const isEmpty = cache.users.length === 0 && cache.products.length === 0;
    if (isEmpty && importFromJsonFile()) {
      console.log('[store] Importing existing db.json into MySQL...');
      await persistAllToMySQL();
      console.log('[store] db.json imported to MySQL');
    }

    initialized = true;
    initError = null;
    console.log('[store] Using MySQL for data storage');
  } catch (err) {
    initialized = false;
    initError = err;
    setDatabaseError(err);
    console.error('[store] MySQL initialization failed:', err.message);

    if (!hasDatabaseUrl()) {
      console.warn('[store] Falling back to local db.json (no DATABASE_URL)');
      ensureDir(DATA_DIR);
      if (importFromJsonFile()) {
        console.log('[store] Loaded data from db.json');
      } else {
        cache = structuredClone(defaultDb);
      }
    }
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
        if (f.name?.$regex) return new RegExp(f.name.$regex, f.name.$options || 'i').test(i.name || i.productName || '');
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
    if (query.reference) return items.find(i => i.reference === query.reference || i.quotationNumber === query.reference) || null;
    if (query.key) return items.find(i => i.key === query.key) || null;
    return null;
  }

  countDocuments(filter = {}) {
    return this.find(filter).length;
  }

  async insertMany(docs) {
    const withIds = docs.map(d => ({
      ...d,
      _id: d._id || randomUUID(),
      createdAt: d.createdAt || new Date().toISOString(),
    }));
    cache[this.name] = [...(cache[this.name] || []), ...withIds];
    for (const doc of withIds) {
      await persistDoc(this.name, doc);
    }
    touchCache();
    return withIds;
  }

  async create(doc) {
    const [created] = await this.insertMany([doc]);
    return created;
  }

  async findByIdAndUpdate(id, data, opts = {}) {
    const idx = (cache[this.name] || []).findIndex(i => i._id === id);
    if (idx === -1) return null;
    cache[this.name][idx] = { ...cache[this.name][idx], ...data, updatedAt: new Date().toISOString() };
    await persistDoc(this.name, cache[this.name][idx]);
    touchCache();
    return opts.new !== false ? cache[this.name][idx] : cache[this.name][idx];
  }

  async findByIdAndDelete(id) {
    const item = (cache[this.name] || []).find(i => i._id === id);
    cache[this.name] = (cache[this.name] || []).filter(i => i._id !== id);
    if (item) await persistDelete(this.name, id);
    touchCache();
    return item;
  }

  async deleteMany() {
    const ids = (cache[this.name] || []).map(i => i._id);
    cache[this.name] = [];
    if (initialized) {
      for (const id of ids) {
        await persistDelete(this.name, id);
      }
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
  persistSettings().catch(err => console.error('Settings persist failed:', err.message));
  touchCache();
  return cache.settings;
}

export function getCms() {
  return cache.cms || {};
}

export function saveCms(data) {
  cache.cms = { ...cache.cms, ...data, updatedAt: new Date().toISOString() };
  persistSettings().catch(err => console.error('CMS persist failed:', err.message));
  touchCache();
  return cache.cms;
}

export function getAnalytics() {
  return cache.analytics || { visitors: [], pageViews: [], dailyStats: [] };
}

export function saveAnalytics(data) {
  cache.analytics = { ...cache.analytics, ...data };
  persistSettings().catch(err => console.error('Analytics persist failed:', err.message));
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
    persistAllToMySQL().catch(err => console.error('MySQL reset failed:', err.message));
  }
  touchCache();
}

export function backupDb() {
  ensureDir(DATA_DIR);
  const backupPath = join(DATA_DIR, `backup-${Date.now()}.json`);
  try {
    writeFileSync(backupPath, JSON.stringify(cache, null, 2));
    if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
    else copyFileSync(DB_FILE, join(DATA_DIR, `db-snapshot-${Date.now()}.json`));
    writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn('Could not create backup file:', err.message);
  }
  return backupPath;
}

export async function exportDatabase() {
  return JSON.stringify(cache, null, 2);
}

export function restoreDb(fromPath) {
  if (!existsSync(fromPath)) throw new Error('Backup file not found');
  cache = JSON.parse(readFileSync(fromPath, 'utf8'));
  Object.keys(defaultDb).forEach(k => { if (!cache[k]) cache[k] = defaultDb[k]; });
  if (initialized) {
    persistAllToMySQL().catch(err => console.error('MySQL restore failed:', err.message));
  }
  touchCache();
}

export function importDatabase(jsonString) {
  const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  cache = { ...structuredClone(defaultDb), ...data };
  if (initialized) {
    persistAllToMySQL().catch(err => console.error('MySQL import failed:', err.message));
  }
  touchCache();
}

export function load() {
  return cache;
}

export function save(db) {
  cache = { ...cache, ...db };
  if (initialized) {
    persistAllToMySQL().catch(err => console.error('MySQL save failed:', err.message));
  }
}

export { prisma };
