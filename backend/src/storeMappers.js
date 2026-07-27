/** Maps between in-memory cache documents (_id fields) and Prisma/MySQL rows */

import { randomUUID } from 'crypto';

function iso(d) {
  if (!d) return undefined;
  return d instanceof Date ? d.toISOString() : d;
}

function num(v) {
  if (v == null) return 0;
  return typeof v === 'object' && v.toNumber ? v.toNumber() : Number(v);
}

function dec(v) {
  return v == null ? undefined : num(v);
}

export function userToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.fullName,
    fullName: row.fullName,
    company: row.companyName,
    companyName: row.companyName,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    password: row.password,
    role: row.role,
    adminRole: row.adminRole,
    status: row.status,
    active: row.active,
    lastLogin: iso(row.lastLogin),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function userFromCache(doc) {
  return {
    id: doc._id,
    fullName: doc.fullName || doc.name || '',
    companyName: doc.companyName ?? doc.company ?? null,
    email: doc.email,
    phone: doc.phone ?? null,
    whatsapp: doc.whatsapp ?? null,
    address: doc.address ?? null,
    password: doc.password,
    role: doc.role || 'customer',
    adminRole: doc.adminRole ?? null,
    status: doc.status || 'active',
    active: doc.active !== false,
    lastLogin: doc.lastLogin ? new Date(doc.lastLogin) : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

export function categoryToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.categoryName,
    categoryName: row.categoryName,
    slug: row.slug,
    description: row.description,
    image: row.image,
    icon: row.icon,
    order: row.sortOrder,
    status: row.status,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function categoryFromCache(doc) {
  return {
    id: doc._id,
    categoryName: doc.categoryName || doc.name || '',
    slug: doc.slug,
    description: doc.description ?? null,
    image: doc.image ?? null,
    icon: doc.icon ?? null,
    sortOrder: doc.sortOrder ?? doc.order ?? 0,
    status: doc.status || 'active',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

export function brandToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.brandName,
    brandName: row.brandName,
    logo: row.logo,
    description: row.description,
    website: row.website,
    country: row.country,
    featured: row.featured,
    status: row.status,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function brandFromCache(doc) {
  return {
    id: doc._id,
    brandName: doc.brandName || doc.name || '',
    logo: doc.logo ?? null,
    description: doc.description ?? null,
    website: doc.website ?? null,
    country: doc.country ?? null,
    featured: doc.featured !== false,
    status: doc.status || 'active',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

export function productToCache(row, images = []) {
  if (!row) return null;
  const imageUrls = images.map(i => i.imageUrl);
  return {
    _id: row.id,
    name: row.productName,
    productName: row.productName,
    productCode: row.productCode,
    sku: row.productCode,
    slug: row.slug,
    category: row.categoryId,
    brand: row.brandId,
    description: row.description,
    specification: row.specification,
    specifications: row.specification,
    image: row.image || imageUrls[0] || null,
    images: imageUrls.length ? imageUrls : row.image ? [row.image] : [],
    datasheet: row.datasheet,
    status: row.status,
    featured: row.featured,
    tags: row.tags || [],
    archived: row.archived,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function productFromCache(doc) {
  return {
    id: doc._id,
    productName: doc.productName || doc.name || '',
    productCode: doc.productCode ?? doc.sku ?? null,
    slug: doc.slug,
    categoryId: doc.categoryId ?? doc.category ?? null,
    brandId: doc.brandId ?? doc.brand ?? null,
    description: doc.description ?? null,
    specification: doc.specification ?? doc.specifications ?? null,
    image: doc.image ?? doc.images?.[0] ?? null,
    datasheet: doc.datasheet ?? null,
    status: doc.status || (doc.archived ? 'archived' : 'active'),
    featured: !!doc.featured,
    tags: doc.tags ?? null,
    archived: !!doc.archived,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

export function quotationToCache(row, items = []) {
  if (!row) return null;
  const extra = row.extra || {};
  const mappedItems = items.map(itemToCacheItem);
  return {
    _id: row.id,
    reference: row.quotationNumber,
    quotationNumber: row.quotationNumber,
    userId: row.customerId,
    customerId: row.customerId,
    requestDate: iso(row.requestDate),
    subtotal: dec(row.subtotal),
    discount: dec(row.discount),
    netAmount: dec(row.netAmount),
    vatPercentage: dec(row.vatPercentage),
    vat: dec(row.vatPercentage),
    vatAmount: dec(row.vatAmount),
    totalAmount: dec(row.grandTotal),
    grandTotal: dec(row.grandTotal),
    status: row.status,
    remarks: row.remarks,
    priority: row.priority,
    assignedTo: row.assignedTo,
    archived: row.archived,
    customer: row.customer,
    charges: row.charges,
    timeline: row.timeline || [],
    revisions: row.revisions || [],
    items: mappedItems,
    ...extra,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function itemToCacheItem(row) {
  const extra = row.extra || {};
  return {
    _id: row.id,
    product: row.productId,
    productId: row.productId,
    productName: extra.productName,
    description: row.description,
    quantity: row.quantity,
    unit: row.unit,
    unitPrice: dec(row.unitPrice),
    totalPrice: dec(row.amount),
    amount: dec(row.amount),
    ...extra,
  };
}

export function quotationFromCache(doc) {
  const {
    customer, charges, timeline, revisions, items,
    deliveryCharges, paymentTerms, deliveryTime, warranty, validityPeriod,
    currency, incoterms, internalNotes, customerNotes, pricingNotes,
    approvalComments, followUpNotes, version, viewedAt, sentAt, quotedAt,
    quotedBy, requiredDeliveryDate, customerResponse, customerRespondedAt,
    adminNotes, installationDetails, afterSalesSupport,
  } = doc;

  const extra = {
    deliveryCharges, paymentTerms, deliveryTime, warranty, validityPeriod,
    currency, incoterms, internalNotes, customerNotes, pricingNotes,
    approvalComments, followUpNotes, version, viewedAt, sentAt, quotedAt,
    quotedBy, requiredDeliveryDate, customerResponse, customerRespondedAt,
    adminNotes, installationDetails, afterSalesSupport,
  };
  Object.keys(extra).forEach(k => extra[k] === undefined && delete extra[k]);

  return {
    id: doc._id,
    quotationNumber: doc.quotationNumber || doc.reference,
    customerId: doc.customerId ?? doc.userId ?? null,
    requestDate: doc.requestDate ? new Date(doc.requestDate) : undefined,
    subtotal: doc.subtotal ?? 0,
    discount: doc.discount ?? 0,
    netAmount: doc.netAmount ?? 0,
    vatPercentage: doc.vatPercentage ?? doc.vat ?? 18,
    vatAmount: doc.vatAmount ?? 0,
    grandTotal: doc.grandTotal ?? doc.totalAmount ?? 0,
    status: doc.status || 'new_request',
    remarks: doc.remarks ?? doc.adminNotes ?? null,
    priority: doc.priority ?? null,
    assignedTo: doc.assignedTo ?? null,
    archived: !!doc.archived,
    customer: customer ?? null,
    charges: charges ?? null,
    timeline: timeline ?? null,
    revisions: revisions ?? null,
    extra: Object.keys(extra).length ? extra : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

export function quotationItemsFromCache(doc) {
  return doc.items || [];
}

export function quotationItemFromCache(item, quotationId) {
  const { productName, preferredBrand, requiredDate, deliveryLocation, specialNotes, itemDiscount, ...rest } = item;
  const extra = {
    productName,
    preferredBrand,
    requiredDate,
    deliveryLocation,
    specialNotes,
    itemDiscount,
    ...rest,
  };
  Object.keys(extra).forEach(k => {
    if (extra[k] === undefined || ['_id', 'product', 'productId', 'description', 'quantity', 'unit', 'unitPrice', 'totalPrice', 'amount'].includes(k)) {
      delete extra[k];
    }
  });

  return {
    id: item._id || randomUUID(),
    quotationId,
    productId: item.productId ?? item.product ?? null,
    description: item.description ?? null,
    quantity: item.quantity ?? 1,
    unit: item.unit || 'pcs',
    unitPrice: item.unitPrice ?? 0,
    amount: item.amount ?? item.totalPrice ?? 0,
    extra: Object.keys(extra).length ? extra : null,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
  };
}

export function messageToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    subject: row.subject,
    message: row.message,
    status: row.status,
    read: row.read,
    createdAt: iso(row.createdAt),
  };
}

export function messageFromCache(doc) {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? null,
    company: doc.company ?? null,
    subject: doc.subject ?? null,
    message: doc.message,
    status: doc.status || (doc.read ? 'read' : 'unread'),
    read: !!doc.read,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  };
}

export function teamToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    position: row.designation,
    designation: row.designation,
    photo: row.image,
    image: row.image,
    description: row.description,
    email: row.email,
    phone: row.phone,
    experience: row.experience,
    department: row.department,
    biography: row.biography,
    order: row.displayOrder,
    displayOrder: row.displayOrder,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function teamFromCache(doc) {
  return {
    id: doc._id,
    name: doc.name,
    designation: doc.designation || doc.position || '',
    image: doc.image ?? doc.photo ?? null,
    description: doc.description ?? null,
    email: doc.email ?? null,
    phone: doc.phone ?? null,
    experience: doc.experience ?? null,
    department: doc.department ?? null,
    biography: doc.biography ?? null,
    displayOrder: doc.displayOrder ?? doc.order ?? 0,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

export function galleryToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    title: row.title,
    url: row.imageUrl,
    imageUrl: row.imageUrl,
    category: row.category,
    type: row.type,
    featured: row.featured,
    createdAt: iso(row.createdAt),
  };
}

export function galleryFromCache(doc) {
  return {
    id: doc._id,
    title: doc.title ?? null,
    imageUrl: doc.imageUrl || doc.url || '',
    category: doc.category ?? null,
    type: doc.type || 'image',
    featured: !!doc.featured,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  };
}

export function projectToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    industry: row.industry,
    location: row.location,
    clientName: row.clientName,
    status: row.status,
    images: row.images || [],
    featured: row.featured,
    completedAt: iso(row.completedAt),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function projectFromCache(doc) {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description ?? null,
    industry: doc.industry ?? null,
    location: doc.location ?? null,
    clientName: doc.clientName ?? null,
    status: doc.status ?? null,
    images: doc.images ?? null,
    featured: !!doc.featured,
    completedAt: doc.completedAt ? new Date(doc.completedAt) : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

export function testimonialToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.customerName,
    customerName: row.customerName,
    company: row.companyName,
    companyName: row.companyName,
    image: row.image,
    content: row.review,
    review: row.review,
    rating: row.rating,
    role: row.role,
    featured: row.featured,
    createdAt: iso(row.createdAt),
  };
}

export function testimonialFromCache(doc) {
  return {
    id: doc._id,
    customerName: doc.customerName || doc.name || '',
    companyName: doc.companyName ?? doc.company ?? null,
    image: doc.image ?? null,
    review: doc.review || doc.content || '',
    rating: doc.rating ?? 5,
    role: doc.role ?? null,
    featured: doc.featured !== false,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  };
}

export function faqToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    order: row.displayOrder,
    displayOrder: row.displayOrder,
    createdAt: iso(row.createdAt),
  };
}

export function faqFromCache(doc) {
  return {
    id: doc._id,
    question: doc.question,
    answer: doc.answer,
    category: doc.category ?? null,
    displayOrder: doc.displayOrder ?? doc.order ?? 0,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  };
}

export function newsletterToCache(row) {
  if (!row) return null;
  return { _id: row.id, email: row.email, status: row.status, createdAt: iso(row.createdAt) };
}

export function newsletterFromCache(doc) {
  return {
    id: doc._id,
    email: doc.email,
    status: doc.status || 'active',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  };
}

export function downloadToCache(row) {
  if (!row) return null;
  return { _id: row.id, title: row.title, type: row.type, url: row.url, category: row.category, createdAt: iso(row.createdAt) };
}

export function downloadFromCache(doc) {
  return {
    id: doc._id,
    title: doc.title,
    type: doc.type ?? null,
    url: doc.url,
    category: doc.category ?? null,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  };
}

export function notificationToCache(row) {
  if (!row) return null;
  return { _id: row.id, type: row.type, title: row.title, message: row.message, read: row.read, createdAt: iso(row.createdAt) };
}

export function notificationFromCache(doc) {
  return {
    id: doc._id,
    type: doc.type ?? null,
    title: doc.title ?? null,
    message: doc.message ?? null,
    read: !!doc.read,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  };
}

export function activityToCache(row) {
  if (!row) return null;
  return {
    _id: row.id,
    userId: row.userId,
    type: row.type,
    activity: row.activity,
    message: row.message || row.activity,
    meta: row.meta,
    ip: row.ipAddress,
    ipAddress: row.ipAddress,
    browser: row.browser,
    createdAt: iso(row.createdAt),
  };
}

export function activityFromCache(doc) {
  return {
    id: doc._id,
    userId: doc.userId ?? null,
    type: doc.type ?? null,
    activity: doc.activity || doc.message || doc.type || 'activity',
    message: doc.message ?? null,
    meta: doc.meta ?? null,
    ipAddress: doc.ipAddress ?? doc.ip ?? null,
    browser: doc.browser ?? null,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  };
}
