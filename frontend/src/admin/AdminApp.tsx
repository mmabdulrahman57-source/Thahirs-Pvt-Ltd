import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import AdminsPage from './pages/AdminsPage';
import RolesPage from './pages/RolesPage';
import ProductsAdminPage from './pages/ProductsAdminPage';
import QuotationsAdminPage from './pages/QuotationsAdminPage';
import MessagesAdminPage from './pages/MessagesAdminPage';
import NewsletterAdminPage from './pages/NewsletterAdminPage';
import NotificationsAdminPage from './pages/NotificationsAdminPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CmsPage from './pages/CmsPage';
import SettingsPage from './pages/SettingsPage';
import BackupPage from './pages/BackupPage';
import LogsPage from './pages/LogsPage';
import {
  CategoriesAdminPage, BrandsAdminPage, DownloadsAdminPage,
  TeamAdminPage, ProjectsAdminPage, GalleryAdminPage,
  TestimonialsAdminPage, FaqsAdminPage,
} from './pages/ContentPages';

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="products" element={<ProductsAdminPage />} />
        <Route path="categories" element={<CategoriesAdminPage />} />
        <Route path="brands" element={<BrandsAdminPage />} />
        <Route path="downloads" element={<DownloadsAdminPage />} />
        <Route path="quotations" element={<QuotationsAdminPage />} />
        <Route path="quotations/:filter" element={<QuotationsAdminPage />} />
        <Route path="projects" element={<ProjectsAdminPage />} />
        <Route path="team" element={<TeamAdminPage />} />
        <Route path="gallery" element={<GalleryAdminPage />} />
        <Route path="testimonials" element={<TestimonialsAdminPage />} />
        <Route path="faqs" element={<FaqsAdminPage />} />
        <Route path="messages" element={<MessagesAdminPage />} />
        <Route path="newsletter" element={<NewsletterAdminPage />} />
        <Route path="notifications" element={<NotificationsAdminPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="cms" element={<CmsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
