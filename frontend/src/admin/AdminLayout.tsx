import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, Package, FolderTree, Award, FileText, Download,
  MessageSquare, Mail, Users2, Image, Star, HelpCircle, Briefcase, BarChart3,
  Bell, Globe, Settings, Database, ScrollText, LogOut, Menu, X, ChevronDown,
  FileBarChart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminNotifications } from './api';
import Logo from '../components/ui/Logo';
import AdminSearchBar from './components/SearchBar';

type NavItem = { to: string; icon: LucideIcon; label: string; end?: boolean };

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    title: 'Users',
    items: [
      { to: '/admin/customers', icon: Users, label: 'Customers' },
      { to: '/admin/admins', icon: Shield, label: 'Admins' },
      { to: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
    ],
  },
  {
    title: 'Products',
    items: [
      { to: '/admin/products', icon: Package, label: 'Products' },
      { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
      { to: '/admin/brands', icon: Award, label: 'Brands' },
      { to: '/admin/downloads', icon: Download, label: 'Downloads' },
    ],
  },
  {
    title: 'Quotations',
    items: [
      { to: '/admin/quotations', icon: FileText, label: 'All Requests', end: true },
      { to: '/admin/quotations/pending', icon: FileText, label: 'New / Pending' },
      { to: '/admin/quotations/approved', icon: FileText, label: 'Sent to Customer' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/projects', icon: Briefcase, label: 'Projects' },
      { to: '/admin/team', icon: Users2, label: 'Team' },
      { to: '/admin/gallery', icon: Image, label: 'Gallery' },
      { to: '/admin/testimonials', icon: Star, label: 'Testimonials' },
      { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { to: '/admin/messages', icon: MessageSquare, label: 'Contact Messages' },
      { to: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
      { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { to: '/admin/reports', icon: FileBarChart, label: 'Reports' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/cms', icon: Globe, label: 'Website CMS' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
      { to: '/admin/backup', icon: Database, label: 'Backup & Restore' },
      { to: '/admin/logs', icon: ScrollText, label: 'System Logs' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    adminNotifications().then(n => setUnread(n.filter((x: { read: boolean }) => !x.read).length)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-charcoal/95 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1f2e] text-white flex flex-col transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1">
              <Logo size="sm" className="!h-full !w-full !object-contain !object-top scale-125 origin-top" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="font-bold text-sm truncate">THAHIRS</div>
              <div className="text-[10px] text-primary truncate">Enterprise Admin</div>
            </div>
          </Link>
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navSections.map(section => (
            <div key={section.title}>
              <button onClick={() => setCollapsed(c => ({ ...c, [section.title]: !c[section.title] }))}
                className="flex items-center justify-between w-full px-2 py-1 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                {section.title}
                <ChevronDown size={12} className={`transition-transform ${collapsed[section.title] ? '-rotate-90' : ''}`} />
              </button>
              {!collapsed[section.title] && (
                <div className="space-y-0.5 mt-1">
                  {section.items.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.end ?? false}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                      <item.icon size={16} /> {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/50 truncate">{user?.name}</div>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white dark:bg-charcoal border-b border-steel/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-steel/10 shrink-0"><Menu size={20} /></button>
            <AdminSearchBar className="hidden sm:block flex-1 max-w-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/notifications" className="relative p-2 rounded-lg hover:bg-steel/10">
              <Bell size={18} />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">{unread}</span>}
            </Link>
            <Link to="/" className="text-sm text-primary font-medium hover:underline hidden sm:block">View Site</Link>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">{user?.name?.charAt(0)}</div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
