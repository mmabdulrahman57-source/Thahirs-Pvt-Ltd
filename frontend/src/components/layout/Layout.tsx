import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';
import MobileBottomNav from './MobileBottomNav';
import { MobileNavProvider } from '../../context/MobileNavContext';

export default function Layout() {
  return (
    <MobileNavProvider>
      <div className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Navbar />
        <main id="main-content" className="flex-1 pt-[60px] md:pt-[72px] pb-[72px] md:pb-0">
          <Outlet />
        </main>
        <Footer />
        <FloatingButtons />
        <MobileBottomNav />
      </div>
    </MobileNavProvider>
  );
}
