import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Bell, Headphones, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Logo from '../../components/ui/Logo';

const sidebarLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/quotations', icon: FileText, label: 'My Quotations' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { to: '/dashboard/support', icon: Headphones, label: 'Support' },
];

function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location]);

  return (
    <div className="min-h-screen bg-light dark:bg-charcoal/95 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-charcoal border-r border-steel/10 flex flex-col transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-steel/10 shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <Logo size="sm" className="rounded-md" />
            <div>
              <div className="font-bold text-sm">THAHIRS</div>
              <div className="text-xs text-primary">Customer Portal</div>
            </div>
          </Link>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {sidebarLinks.map(link => {
            const active = link.end ? location.pathname === link.to : location.pathname.startsWith(link.to);
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-primary/5 text-charcoal/70 dark:text-white/70'}`}>
                <link.icon size={18} /> {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-steel/10 shrink-0 mt-auto">
          <div className="px-4 py-2 mb-2">
            <div className="font-semibold text-sm truncate">{user?.name}</div>
            <div className="text-xs text-charcoal/50 truncate">{user?.email}</div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-charcoal/90 backdrop-blur-xl border-b border-steel/10 px-4 sm:px-8 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-steel/10"><Menu size={20} /></button>
          <h1 className="font-bold text-lg capitalize">{location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
          <Link to="/quotation" className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex">New Quotation</Link>
        </header>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  return (
    <ProtectedRoute role="customer">
      <DashboardLayout />
    </ProtectedRoute>
  );
}
