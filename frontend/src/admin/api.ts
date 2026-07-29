import api from '../lib/api';

const admin = (path: string, opts?: object) => api.get(`/admin${path}`, opts).then(r => r.data);
const adminPost = (path: string, data?: unknown) => api.post(`/admin${path}`, data).then(r => r.data);
const adminPut = (path: string, data?: unknown) => api.put(`/admin${path}`, data).then(r => r.data);
const adminDel = (path: string) => api.delete(`/admin${path}`).then(r => r.data);

export const adminDashboard = () => admin('/dashboard');
export const adminCustomers = (search?: string) => admin('/customers', { params: { search } });
export const adminCreateCustomer = (d: unknown) => adminPost('/customers', d);
export const adminUpdateCustomer = (id: string, d: unknown) => adminPut(`/customers/${id}`, d);
export const adminDeleteCustomer = (id: string) => adminDel(`/customers/${id}`);
export const adminCustomerQuotations = (id: string) => admin(`/customers/${id}/quotations`);

export const adminAdmins = () => admin('/admins');
export const adminCreateAdmin = (d: unknown) => adminPost('/admins', d);
export const adminUpdateAdmin = (id: string, d: unknown) => adminPut(`/admins/${id}`, d);
export const adminDeleteAdmin = (id: string) => adminDel(`/admins/${id}`);
export const adminRoles = () => admin('/roles');
export const adminPermissions = () => admin('/permissions');

export const adminList = (resource: string) => admin(`/${resource}`);
export const adminGet = (resource: string, id: string) => admin(`/${resource}/${id}`);
export const adminCreate = (resource: string, d: unknown) => adminPost(`/${resource}`, d);
export const adminUpdate = (resource: string, id: string, d: unknown) => adminPut(`/${resource}/${id}`, d);
export const adminDelete = (resource: string, id: string) => adminDel(`/${resource}/${id}`);

export const adminQuotations = (params?: Record<string, string | undefined>) => admin('/quotations', { params });
export const adminQuotationDashboard = () => admin('/quotations/dashboard');
export const adminGetQuotation = (id: string) => admin(`/quotations/${id}`);
export const adminUpdateQuotation = (id: string, d: unknown) => adminPut(`/quotations/${id}`, d);
export const adminQuotationPdf = (id: string) => api.get(`/admin/quotations/${id}/pdf`, { responseType: 'blob' }).then(r => r.data);
export const adminDuplicateQuotation = (id: string) => adminPost(`/quotations/${id}/duplicate`);
export const adminArchiveQuotation = (id: string) => adminPut(`/quotations/${id}/archive`);
export const adminDeleteQuotation = (id: string) => adminDel(`/quotations/${id}`);
export const adminBulkQuotations = (ids: string[], action: string, value?: string) => adminPost('/quotations/bulk', { ids, action, value });
export const adminDuplicateProduct = (id: string) => adminPost(`/products/${id}/duplicate`);
export const adminArchiveProduct = (id: string) => adminPut(`/products/${id}/archive`);
export const adminRestoreProduct = (id: string) => adminPut(`/products/${id}/restore`);

export const adminMessages = () => admin('/messages');
export const adminUpdateMessage = (id: string, d: unknown) => adminPut(`/messages/${id}`, d);
export const adminDeleteMessage = (id: string) => adminDel(`/messages/${id}`);
export const adminMarkMessageRead = (id: string) => adminPut(`/messages/${id}/read`);

export const adminNewsletter = () => admin('/newsletter');
export const adminDeleteSubscriber = (id: string) => adminDel(`/newsletter/${id}`);

export const adminNotifications = () => admin('/notifications');
export const adminMarkNotificationRead = (id: string) => adminPut(`/notifications/${id}/read`);
export const adminMarkAllNotificationsRead = () => adminPut('/notifications/read-all');

export const adminCms = () => admin('/cms');
export const adminSaveCms = (d: unknown) => adminPut('/cms', d);
export const adminSettings = () => admin('/settings');
export const adminSaveSettings = (d: unknown) => adminPut('/settings', d);
export const adminAnalytics = () => admin('/analytics');
export const adminReport = (type: string) => admin(`/reports/${type}`);
export const adminBackup = () => adminPost('/backup');
export const adminBackups = () => admin('/backups');
export const adminLogs = () => admin('/logs');
export const adminLoginLogs = () => admin('/logs/login');

export const adminUploadImage = (file: File) => {
  const form = new FormData();
  form.append('image', file);
  // Do not set Content-Type — axios must add the multipart boundary automatically
  return api.post('/admin/upload/image', form).then(r => r.data as { url: string; filename: string });
};
