import { ActivityLog } from '../jsonStore.js';

export function logActivity(type, message, userId, meta = {}) {
  ActivityLog.create({
    type,
    message,
    userId,
    meta,
    ip: meta.ip || 'local',
  });
}

export const ROLES = [
  { _id: 'super_admin', name: 'Super Admin', permissions: ['*'] },
  { _id: 'admin', name: 'Admin', permissions: ['dashboard', 'products', 'categories', 'brands', 'quotations', 'users', 'messages', 'gallery', 'reports', 'settings'] },
  { _id: 'sales_manager', name: 'Sales Manager', permissions: ['dashboard', 'quotations', 'users', 'messages', 'reports'] },
  { _id: 'product_manager', name: 'Product Manager', permissions: ['dashboard', 'products', 'categories', 'brands', 'downloads'] },
  { _id: 'content_manager', name: 'Content Manager', permissions: ['dashboard', 'gallery', 'team', 'projects', 'testimonials', 'faqs', 'cms'] },
  { _id: 'customer_support', name: 'Customer Support', permissions: ['dashboard', 'messages', 'users', 'quotations'] },
  { _id: 'finance_officer', name: 'Finance Officer', permissions: ['dashboard', 'quotations', 'reports'] },
];

export const PERMISSIONS = [
  'dashboard', 'products', 'categories', 'brands', 'quotations', 'users', 'messages',
  'gallery', 'reports', 'settings', 'team', 'projects', 'testimonials', 'faqs', 'cms',
  'newsletter', 'analytics', 'backup', 'logs', 'downloads', 'notifications',
];
