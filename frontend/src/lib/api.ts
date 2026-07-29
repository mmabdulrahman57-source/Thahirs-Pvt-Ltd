import axios from 'axios';
import { STATIC_CATEGORIES, STATIC_BRANDS } from '../data/static';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('thahirs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('thahirs_token');
      localStorage.removeItem('thahirs_user');
    }
    return Promise.reject(err);
  }
);

export function getApiError(err: unknown, fallback = 'Request failed') {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
}

export default api;

export const getProducts = (params?: Record<string, string>) => api.get('/products', { params }).then(r => r.data);
export const getProduct = (slug: string) => api.get(`/products/${slug}`).then(r => r.data);
export const searchProducts = (q: string) => api.get('/products/search', { params: { q } }).then(r => r.data);
export const getCategories = () => api.get('/products/categories').then(r => r.data).catch(() => STATIC_CATEGORIES);
export const getBrands = () => api.get('/products/brands').then(r => r.data).catch(() => STATIC_BRANDS);
export const getTeam = () => api.get('/team').then(r => r.data);
export const getGallery = (category?: string) => api.get('/gallery', { params: { category } }).then(r => r.data);
export const getProjects = () => api.get('/projects').then(r => r.data);
export const getTestimonials = () => api.get('/testimonials').then(r => r.data);
export const getStats = () => api.get('/stats').then(r => r.data);
export const submitQuotation = (data: unknown) => api.post('/quotations', data).then(r => r.data);
export const submitContact = (data: unknown) => api.post('/messages', data).then(r => r.data);
export const login = (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data);
export const register = (data: unknown) => api.post('/auth/register', data).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const updateProfile = (data: unknown) => api.put('/auth/profile', data).then(r => r.data);
export const getDashboard = () => api.get('/dashboard').then(r => r.data);
export const getQuotations = () => api.get('/quotations').then(r => r.data);
export const getMyQuotations = () => api.get('/quotations/my').then(r => r.data);
export const getMyQuotationStats = () => api.get('/quotations/my/stats').then(r => r.data);
export const getQuotation = (id: string) => api.get(`/quotations/${id}`).then(r => r.data);
export const updateQuotation = (id: string, data: unknown) => api.put(`/quotations/${id}`, data).then(r => r.data);
export const downloadQuotationPdf = (id: string) => api.get(`/quotations/${id}/pdf`, { responseType: 'blob' }).then(r => r.data);
export const respondToQuotation = (id: string, action: 'accept' | 'reject' | 'revision', message?: string) =>
  api.put(`/quotations/${id}/respond`, { action, message }).then(r => r.data);
export const markQuotationViewed = (id: string) => api.put(`/quotations/${id}/viewed`).then(r => r.data);
export const getMessages = () => api.get('/messages').then(r => r.data);
