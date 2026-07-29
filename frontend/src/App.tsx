import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { QuotationProvider } from './context/QuotationContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/ScrollToTop';
import { PageLoader } from './components/ui/Skeleton';
import HomePage from './pages/HomePage';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const QuotationPage = lazy(() => import('./pages/QuotationPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CustomerDashboard = lazy(() => import('./pages/dashboard/CustomerDashboard'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const MyQuotations = lazy(() => import('./pages/dashboard/MyQuotations'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'));
const SupportPage = lazy(() => import('./pages/dashboard/SupportPage'));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuotationProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Lazy><LoginPage /></Lazy>} />
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<Lazy><AboutPage /></Lazy>} />
                <Route path="products" element={<Lazy><ProductsPage /></Lazy>} />
                <Route path="products/:slug" element={<Lazy><ProductDetailPage /></Lazy>} />
                <Route path="services" element={<Lazy><ServicesPage /></Lazy>} />
                <Route path="gallery" element={<Lazy><GalleryPage /></Lazy>} />
                <Route path="brands" element={<Lazy><BrandsPage /></Lazy>} />
                <Route path="contact" element={<Lazy><ContactPage /></Lazy>} />
                <Route path="quotation" element={<Lazy><QuotationPage /></Lazy>} />
                <Route path="privacy" element={<Lazy><PrivacyPage /></Lazy>} />
                <Route path="terms" element={<Lazy><TermsPage /></Lazy>} />
              </Route>
              <Route path="dashboard" element={<Lazy><CustomerDashboard /></Lazy>}>
                <Route index element={<Lazy><DashboardHome /></Lazy>} />
                <Route path="quotations" element={<Lazy><MyQuotations /></Lazy>} />
                <Route path="profile" element={<Lazy><ProfilePage /></Lazy>} />
                <Route path="notifications" element={<Lazy><NotificationsPage /></Lazy>} />
                <Route path="support" element={<Lazy><SupportPage /></Lazy>} />
              </Route>
              <Route path="admin/*" element={<Lazy><AdminPage /></Lazy>} />
            </Routes>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </BrowserRouter>
        </QuotationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
