import express from 'express';
import bcrypt from 'bcryptjs';
import { join } from 'path';
import {
  User, Category, Brand, Product, Quotation, Message, TeamMember, Gallery,
  Project, Testimonial, Faq, Newsletter, Download, Notification, ActivityLog,
  populate, getSettings, saveSettings, getCms, saveCms, getAnalytics,
  DATA_DIR,
} from '../jsonStore.js';
import {
  listBackups, createJsonBackup, createSqlBackup, exportDb, restoreFromJson, importFromJson,
} from '../utils/backup.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { logActivity, ROLES, PERMISSIONS } from '../utils/activity.js';
import { generateQuotationPDF } from '../utils/pdf.js';
import { sendEmail, quotationSentEmail, quotationReminderEmail, quotationRevisionEmail } from '../utils/email.js';
import { uploadImage } from '../utils/upload.js';
import {
  QUOTATION_STATUSES, normalizeStatus, calculateQuotationTotals, addTimelineEntry,
  addRevision, getDashboardStats, filterQuotations, generateReference,
} from '../utils/quotationHelpers.js';
import { getTaxSettings, DEFAULT_TAX_SETTINGS } from '../utils/taxSettings.js';

const router = express.Router();
router.use(authMiddleware, adminOnly);

const slugify = (s) => s?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';

function crudRoutes(Collection, opts = {}) {
  const r = express.Router();
  const { populateFields, sortFn, beforeCreate, beforeUpdate } = opts;

  r.get('/', (req, res) => {
    let items = Collection.find(req.query.filter ? JSON.parse(req.query.filter) : {});
    if (sortFn) items = items.sort(sortFn);
    else items = items.reverse();
    if (populateFields) items = populate(items, populateFields);
    res.json(items);
  });

  r.get('/:id', (req, res) => {
    const item = Collection.findOne({ _id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(populateFields ? populate([item], populateFields)[0] : item);
  });

  r.post('/', async (req, res) => {
    try {
      let data = { ...req.body };
      if (beforeCreate) data = await beforeCreate(data);
      if (data.name && !data.slug) data.slug = slugify(data.name);
      const item = await Collection.create(data);
      logActivity('create', `${Collection.name} created: ${data.name || data.title || item._id}`, req.user.id);
      await Notification.create({ type: 'info', title: `New ${Collection.name}`, message: data.name || data.title || 'Item created', read: false });
      res.status(201).json(item);
    } catch (err) {
      console.error(`[admin] create ${Collection.name}:`, err.message);
      res.status(400).json({ message: err.message });
    }
  });

  r.put('/:id', async (req, res) => {
    try {
      let data = { ...req.body };
      if (beforeUpdate) data = await beforeUpdate(data);
      if (data.name) data.slug = slugify(data.name);
      const item = await Collection.findByIdAndUpdate(req.params.id, data);
      if (!item) return res.status(404).json({ message: 'Not found' });
      logActivity('update', `${Collection.name} updated: ${req.params.id}`, req.user.id);
      res.json(item);
    } catch (err) {
      console.error(`[admin] update ${Collection.name}:`, err.message);
      res.status(400).json({ message: err.message });
    }
  });

  r.delete('/:id', async (req, res) => {
    try {
      await Collection.findByIdAndDelete(req.params.id);
      logActivity('delete', `${Collection.name} deleted: ${req.params.id}`, req.user.id);
      res.json({ message: 'Deleted' });
    } catch (err) {
      console.error(`[admin] delete ${Collection.name}:`, err.message);
      res.status(400).json({ message: err.message });
    }
  });

  return r;
}

// ─── DASHBOARD ───
router.get('/dashboard', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const customers = User.find({ role: 'customer' });
  const newCustomers = customers.filter(c => c.createdAt?.startsWith(today));
  const quotes = Quotation.find();
  const analytics = getAnalytics();

  const stats = {
    totalVisitors: analytics.totalVisitors || 12450,
    todayVisitors: analytics.todayVisitors || 342,
    totalCustomers: customers.length,
    newCustomers: newCustomers.length,
    totalProducts: Product.countDocuments({ archived: false }),
    totalCategories: Category.countDocuments(),
    totalBrands: Brand.countDocuments(),
    totalQuotations: quotes.length,
    pendingQuotations: Quotation.countDocuments({ status: 'pending' }),
    reviewingQuotations: Quotation.countDocuments({ status: 'reviewing' }),
    approvedQuotations: Quotation.countDocuments({ status: 'approved' }) + Quotation.countDocuments({ status: 'quoted' }),
    rejectedQuotations: Quotation.countDocuments({ status: 'rejected' }),
    completedQuotations: Quotation.countDocuments({ status: 'completed' }),
    contactMessages: Message.countDocuments(),
    unreadMessages: Message.countDocuments({ read: false }),
    newsletterSubscribers: Newsletter.countDocuments(),
    totalTeamMembers: TeamMember.countDocuments(),
    totalProjects: Project.countDocuments(),
    totalGalleryImages: Gallery.countDocuments(),
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyQuotations = months.map((m, i) => ({
    month: m,
    count: quotes.filter(q => new Date(q.createdAt).getMonth() === i).length || Math.floor(Math.random() * 8 + 2),
  }));

  const customerGrowth = months.map((m, i) => ({
    month: m,
    count: customers.filter(c => new Date(c.createdAt).getMonth() === i).length || Math.floor(Math.random() * 5 + 1),
  }));

  const recentActivities = ActivityLog.find().reverse().slice(0, 15);
  if (recentActivities.length === 0) {
    quotes.slice(0, 3).forEach(q => recentActivities.push({
      _id: q._id, type: 'quotation', message: `New quotation ${q.reference}`, createdAt: q.createdAt,
    }));
  }

  res.json({
    stats,
    charts: {
      monthlyQuotations,
      customerGrowth,
      productViews: months.map((m, i) => ({ month: m, views: Math.floor(Math.random() * 500 + 100) })),
      websiteTraffic: months.map((m, i) => ({ month: m, visitors: Math.floor(Math.random() * 800 + 200) })),
      visitorLocations: [
        { country: 'Sri Lanka', count: 8500 }, { country: 'India', count: 1200 },
        { country: 'Maldives', count: 450 }, { country: 'Other', count: 2300 },
      ],
    },
    recentActivities,
    recentQuotations: quotes.reverse().slice(0, 5),
    recentMessages: Message.find().reverse().slice(0, 5),
  });
});

// ─── USERS / CUSTOMERS ───
router.get('/customers', (req, res) => {
  const { search } = req.query;
  let customers = User.find({ role: 'customer' });
  if (search) {
    customers = customers.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    );
  }
  res.json(customers.map(({ password, ...c }) => c).reverse());
});

router.post('/customers', async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    if (User.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
    const hashed = await bcrypt.hash(password || 'customer123', 10);
    const user = await User.create({ name, email, password: hashed, role: 'customer', company, phone, active: true });
    logActivity('user', `Customer created: ${email}`, req.user.id);
    const { password: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    console.error('[admin] create customer:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.put('/customers/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, data);
    if (!user) return res.status(404).json({ message: 'Not found' });
    const { password, ...safe } = user;
    res.json(safe);
  } catch (err) {
    console.error('[admin] update customer:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/customers/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    logActivity('user', `Customer deleted: ${req.params.id}`, req.user.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[admin] delete customer:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.get('/customers/:id/quotations', (req, res) => {
  res.json(Quotation.find({ userId: req.params.id }).reverse());
});

// ─── ADMINS ───
router.get('/admins', (req, res) => {
  res.json(User.find({ role: 'admin' }).map(({ password, ...u }) => u));
});

router.post('/admins', async (req, res) => {
  try {
    const { name, email, password, adminRole } = req.body;
    if (User.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'admin', adminRole: adminRole || 'admin', active: true });
    logActivity('admin', `Admin created: ${email}`, req.user.id);
    const { password: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    console.error('[admin] create admin:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.put('/admins/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, data);
    const { password, ...safe } = user;
    res.json(safe);
  } catch (err) {
    console.error('[admin] update admin:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/admins/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[admin] delete admin:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ─── ROLES ───
router.get('/roles', (_, res) => res.json(ROLES));
router.get('/permissions', (_, res) => res.json(PERMISSIONS));

// ─── PRODUCTS ───
router.use('/products', crudRoutes(Product, {
  populateFields: ['category', 'brand'],
  beforeCreate: (d) => ({ ...d, archived: false, status: d.status || 'active' }),
}));

router.post('/products/:id/duplicate', async (req, res) => {
  try {
    const orig = Product.findOne({ _id: req.params.id });
    if (!orig) return res.status(404).json({ message: 'Not found' });
    const { _id, createdAt, updatedAt, ...data } = orig;
    const copy = await Product.create({ ...data, name: `${data.name} (Copy)`, slug: slugify(`${data.name}-copy-${Date.now()}`) });
    res.status(201).json(copy);
  } catch (err) {
    console.error('[admin] duplicate product:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.put('/products/:id/archive', async (req, res) => {
  try {
    res.json(await Product.findByIdAndUpdate(req.params.id, { archived: true, status: 'archived' }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/products/:id/restore', async (req, res) => {
  try {
    res.json(await Product.findByIdAndUpdate(req.params.id, { archived: false, status: 'active' }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── CATEGORIES, BRANDS, DOWNLOADS ───
router.use('/categories', crudRoutes(Category, { sortFn: (a, b) => (a.order || 0) - (b.order || 0) }));
router.use('/brands', crudRoutes(Brand, { sortFn: (a, b) => a.name.localeCompare(b.name) }));
router.use('/downloads', crudRoutes(Download));

// ─── QUOTATIONS (Enterprise) ───
router.get('/quotations/dashboard', (req, res) => {
  res.json(getDashboardStats(Quotation.find()));
});

router.get('/quotations/statuses', (_, res) => res.json(QUOTATION_STATUSES));

router.get('/quotations', (req, res) => {
  const { status, search, priority, assignedTo, dateFrom, dateTo } = req.query;
  const items = filterQuotations(Quotation.find(), { status, search, priority, assignedTo, dateFrom, dateTo });
  res.json(items);
});

router.get('/quotations/:id', (req, res) => {
  const q = Quotation.findOne({ _id: req.params.id });
  if (!q) return res.status(404).json({ message: 'Not found' });
  const customerHistory = Quotation.find({ userId: q.userId }).filter(x => x._id !== q._id).reverse().slice(0, 5);
  res.json({ ...q, status: normalizeStatus(q.status), customerHistory });
});

router.put('/quotations/:id', async (req, res) => {
  const existing = Quotation.findOne({ _id: req.params.id });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  const data = { ...req.body };
  const totals = calculateQuotationTotals({ ...existing, ...data });
  Object.assign(data, totals);

  if (data.status) data.status = normalizeStatus(data.status);
  if (data.validityPeriod && !data.validUntil) {
    const d = new Date(); d.setDate(d.getDate() + parseInt(data.validityPeriod));
    data.validUntil = d.toISOString().slice(0, 10);
  }

  let timeline = existing.timeline || [];
  if (data.status && data.status !== normalizeStatus(existing.status)) {
    timeline = addTimelineEntry({ timeline }, {
      action: 'status_change', message: `Status → ${data.status.replace(/_/g, ' ')}`,
      userId: req.user.id, userName: req.user.name,
    });
    data.timeline = timeline;
  }
  if (data.assignedTo && data.assignedTo !== existing.assignedTo) {
    timeline = addTimelineEntry({ timeline: data.timeline || timeline }, {
      action: 'assigned', message: `Assigned to ${data.assignedTo}`,
      userId: req.user.id, userName: req.user.name,
    });
    data.timeline = timeline;
  }
  if (data.items && JSON.stringify(data.items) !== JSON.stringify(existing.items)) {
    timeline = addTimelineEntry({ timeline: data.timeline || timeline }, {
      action: 'pricing_updated', message: 'Pricing updated',
      userId: req.user.id, userName: req.user.name,
    });
    data.timeline = timeline;
    data.revisions = addRevision(existing, { editedBy: req.user.id, editedByName: req.user.name, changes: 'Pricing updated' });
  }

  if (['sent_to_customer', 'ready_to_send', 'price_added'].includes(data.status) && data.totalAmount) {
    data.quotedAt = data.quotedAt || new Date().toISOString();
    data.quotedBy = req.user.id;
  }
  if (data.status === 'sent_to_customer') data.sentAt = new Date().toISOString();

  const quotation = await Quotation.findByIdAndUpdate(req.params.id, data);

  if (data.sendEmail && data.status === 'sent_to_customer') {
    await sendEmail({ to: quotation.customer.email, subject: `Quotation ${quotation.reference}`, html: quotationSentEmail(quotation) });
    timeline = addTimelineEntry({ timeline: quotation.timeline || timeline }, { action: 'email_sent', message: 'Quotation emailed', userId: req.user.id, userName: req.user.name });
    await Quotation.findByIdAndUpdate(req.params.id, { timeline });
  }
  if (data.sendReminder) {
    await sendEmail({ to: quotation.customer.email, subject: `Reminder: ${quotation.reference}`, html: quotationReminderEmail(quotation) });
  }
  if (data.sendRevision) {
    await sendEmail({ to: quotation.customer.email, subject: `Revised Quotation ${quotation.reference}`, html: quotationRevisionEmail(quotation) });
  }

  logActivity('quotation', `${quotation.reference} → ${data.status || existing.status}`, req.user.id);
  await Notification.create({ type: 'quotation', title: 'Quotation Updated', message: `${quotation.reference} updated`, read: false });
  res.json(quotation);
});

router.post('/quotations/bulk', async (req, res) => {
  const { ids, action, value } = req.body;
  if (!ids?.length) return res.status(400).json({ message: 'No IDs provided' });
  const results = [];
  for (const id of ids) {
    const q = Quotation.findOne({ _id: id });
    if (!q) continue;
    if (action === 'status') await Quotation.findByIdAndUpdate(id, { status: normalizeStatus(value) });
    else if (action === 'assign') await Quotation.findByIdAndUpdate(id, { assignedTo: value });
    else if (action === 'archive') await Quotation.findByIdAndUpdate(id, { archived: true });
    else if (action === 'delete') await Quotation.findByIdAndDelete(id);
    results.push(id);
  }
  res.json({ updated: results.length });
});

router.get('/quotations/:id/pdf', async (req, res) => {
  const quotation = Quotation.findOne({ _id: req.params.id });
  if (!quotation) return res.status(404).json({ message: 'Not found' });
  const pdf = await generateQuotationPDF(quotation);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${quotation.reference}.pdf`);
  res.send(pdf);
});

router.post('/quotations/:id/duplicate', (req, res) => {
  const orig = Quotation.findOne({ _id: req.params.id });
  if (!orig) return res.status(404).json({ message: 'Not found' });
  const { _id, reference, createdAt, updatedAt, sentAt, quotedAt, timeline, revisions, ...data } = orig;
  const copy = Quotation.create({
    ...data,
    reference: generateReference(),
    status: 'new_request',
    timeline: addTimelineEntry({}, { action: 'duplicated', message: `Duplicated from ${orig.reference}`, userId: req.user.id, userName: req.user.name }),
    revisions: [],
    version: 1.0,
  });
  res.status(201).json(copy);
});

router.put('/quotations/:id/archive', (req, res) => {
  const q = Quotation.findByIdAndUpdate(req.params.id, { archived: true, status: 'cancelled' });
  if (!q) return res.status(404).json({ message: 'Not found' });
  res.json(q);
});

router.delete('/quotations/:id', (req, res) => {
  Quotation.findByIdAndDelete(req.params.id);
  logActivity('delete', `Quotation deleted: ${req.params.id}`, req.user.id);
  res.json({ message: 'Deleted' });
});

router.get('/quotations-report/:type', (req, res) => {
  const quotes = Quotation.find().reverse();
  res.json(quotes);
});

// ─── TEAM, PROJECTS, GALLERY, TESTIMONIALS, FAQS ───
router.use('/team', crudRoutes(TeamMember, { sortFn: (a, b) => (a.order || 0) - (b.order || 0) }));
router.use('/projects', crudRoutes(Project));
router.use('/gallery', crudRoutes(Gallery));
router.use('/testimonials', crudRoutes(Testimonial));
router.use('/faqs', crudRoutes(Faq, { sortFn: (a, b) => (a.order || 0) - (b.order || 0) }));

// ─── MESSAGES ───
router.get('/messages', (req, res) => res.json(Message.find().reverse()));
router.put('/messages/:id', (req, res) => res.json(Message.findByIdAndUpdate(req.params.id, req.body)));
router.delete('/messages/:id', (req, res) => { Message.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });
router.put('/messages/:id/read', (req, res) => res.json(Message.findByIdAndUpdate(req.params.id, { read: true })));

// ─── NEWSLETTER ───
router.get('/newsletter', (req, res) => res.json(Newsletter.find().reverse()));
router.post('/newsletter', (req, res) => {
  if (Newsletter.findOne({ email: req.body.email })) return res.status(400).json({ message: 'Already subscribed' });
  res.status(201).json(Newsletter.create(req.body));
});
router.delete('/newsletter/:id', (req, res) => { Newsletter.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });

// ─── NOTIFICATIONS ───
router.get('/notifications', (req, res) => res.json(Notification.find().reverse().slice(0, 50)));
router.put('/notifications/:id/read', (req, res) => res.json(Notification.findByIdAndUpdate(req.params.id, { read: true })));
router.put('/notifications/read-all', (req, res) => {
  Notification.find().forEach(n => Notification.findByIdAndUpdate(n._id, { read: true }));
  res.json({ message: 'All marked read' });
});

// ─── CMS ───
router.get('/cms', (_, res) => res.json(getCms()));
router.put('/cms', (req, res) => {
  logActivity('cms', 'Website content updated', req.user?.id);
  res.json(saveCms(req.body));
});

// ─── SETTINGS ───
router.get('/settings', (_, res) => res.json(getSettings()));
router.put('/settings', (req, res) => {
  const existing = getSettings();
  const body = { ...req.body };
  const currentUser = User.findOne({ _id: req.user?.id });
  const isSuperAdmin = currentUser?.adminRole === 'super_admin';

  if (body.tax && !isSuperAdmin) {
    body.tax = existing.tax || DEFAULT_TAX_SETTINGS;
  }

  logActivity('settings', 'Settings updated', req.user?.id);
  res.json(saveSettings(body));
});

router.get('/tax-settings', (_, res) => {
  res.json(getTaxSettings());
});

// ─── ANALYTICS ───
router.get('/analytics', (_, res) => {
  const analytics = getAnalytics();
  res.json({
    ...analytics,
    bounceRate: 42.5,
    devices: [{ name: 'Desktop', value: 58 }, { name: 'Mobile', value: 35 }, { name: 'Tablet', value: 7 }],
    browsers: [{ name: 'Chrome', value: 62 }, { name: 'Safari', value: 18 }, { name: 'Firefox', value: 12 }, { name: 'Other', value: 8 }],
    topProducts: Product.find().slice(0, 5).map((p, i) => ({ name: p.name, views: Math.floor(Math.random() * 300 + 50) })),
  });
});

// ─── REPORTS ───
router.get('/reports/:type', (req, res) => {
  const { type } = req.params;
  const data = {
    customers: User.find({ role: 'customer' }).map(({ password, ...c }) => c),
    quotations: Quotation.find(),
    products: Product.find({ archived: false }),
    messages: Message.find(),
    users: User.find({ role: 'customer' }),
  };
  res.json(data[type] || []);
});

// ─── BACKUP ───
router.post('/backup', async (req, res) => {
  try {
    const jsonPath = createJsonBackup();
    let sqlPath = null;
    try { sqlPath = await createSqlBackup(); } catch { /* mysqldump optional */ }
    logActivity('backup', 'Manual backup created', req.user.id);
    res.json({ message: 'Backup created', path: jsonPath, sqlPath });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/backups', (req, res) => {
  try {
    res.json(listBackups());
  } catch { res.json([]); }
});

router.get('/backup/export', async (req, res) => {
  try {
    const data = await exportDb();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=thahirs-export.json');
    res.send(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/backup/import', (req, res) => {
  try {
    importFromJson(req.body?.data || req.body);
    logActivity('backup', 'Database imported from JSON', req.user.id);
    res.json({ message: 'Database imported successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/backup/restore', (req, res) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ message: 'Backup filename required' });
    restoreFromJson(join(DATA_DIR, file));
    logActivity('backup', `Database restored from ${file}`, req.user.id);
    res.json({ message: 'Database restored successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── IMAGE UPLOAD ───
router.post('/upload/image', uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    const { uploadProductImage, getCloudinaryStatus } = await import('../utils/cloudinary.js');
    const url = await uploadProductImage(req.file);
    logActivity('upload', `Image uploaded: ${url}`, req.user.id);
    res.json({
      url,
      filename: req.file.filename,
      storage: getCloudinaryStatus().configured ? 'cloudinary' : 'local',
    });
  } catch (err) {
    console.error('[upload] Image upload failed:', err.message);
    res.status(500).json({ message: err.message || 'Image upload failed' });
  }
});

// ─── LOGS ───
router.get('/logs', (req, res) => res.json(ActivityLog.find().reverse().slice(0, 100)));
router.get('/logs/login', (req, res) => {
  res.json(ActivityLog.find().filter(l => l.type === 'login').reverse().slice(0, 50));
});

export default router;
