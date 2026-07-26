import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Search, FileText, User, ChevronDown, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useQuotation } from '../../context/QuotationContext';
import { useAuth } from '../../context/AuthContext';
import { searchProducts, getCategories } from '../../lib/api';
import Logo from '../ui/Logo';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products', mega: true },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/brands', label: 'Brands' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();
  const { items } = useQuotation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setMegaOpen(false);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(() => searchProducts(query).then(setResults).catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleQuotationClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      sessionStorage.setItem('thahirs_redirect', '/quotation');
      navigate('/login');
    }
  };

  const linkClass = (active: boolean, mega = false) => {
    if (active) return mega ? 'text-primary bg-primary/10' : 'text-primary font-semibold';
    return 'text-charcoal/85 dark:text-white/90 hover:text-primary';
  };

  const iconBtnClass = 'nav-icon-btn nav-icon-btn--dark';
  const iconColor = 'text-charcoal dark:text-white/90';

  const dropdownPanel = 'bg-white dark:bg-charcoal-light border border-steel/15 dark:border-white/10 shadow-xl';
  const dropdownLink = 'text-charcoal dark:text-white/90 hover:bg-primary/5 hover:text-primary';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2.5
        bg-white dark:bg-charcoal
        border-b border-steel/15 dark:border-white/10
        ${scrolled ? 'shadow-md shadow-black/5 dark:shadow-black/30' : 'shadow-sm'}`}
    >
      <div className="container-custom flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="THAHIRS Home">
          <Logo size="md" className="rounded-lg" />
          <div className="hidden sm:block">
            <div className="font-bold text-lg leading-tight text-charcoal dark:text-white">THAHIRS</div>
            <div className="text-xs text-primary font-semibold">Since 1949</div>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main navigation">
          {navLinks.map(link => (
            link.mega ? (
              <div key={link.to} className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
                <Link to={link.to}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to) ? linkClass(true, true) : `${linkClass(false, true)} hover:bg-primary/5 dark:hover:bg-white/10`
                  }`}>
                  {link.label} <ChevronDown size={14} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
                </Link>
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className={`absolute top-full left-0 mt-1 w-72 rounded-xl p-3 z-50 ${dropdownPanel}`}>
                      <div className="grid gap-0.5">
                        {categories.slice(0, 8).map(cat => (
                          <Link key={cat._id} to={`/products?category=${cat._id}`} className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${dropdownLink}`}>
                            {cat.name}
                          </Link>
                        ))}
                        <Link to="/products" className="px-3 py-2.5 rounded-lg text-sm text-primary font-semibold hover:bg-primary/5">View All Products →</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link key={link.to} to={link.to}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${linkClass(isActive(link.to))}`}>
                {link.label}
                {isActive(link.to) && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />}
              </Link>
            )
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button onClick={() => setSearchOpen(!searchOpen)} className={iconBtnClass} aria-label="Search products">
            <Search size={18} className={iconColor} strokeWidth={2.25} />
          </button>
          <Link to="/quotation" onClick={handleQuotationClick} className={`relative hidden sm:inline-flex ${iconBtnClass}`} aria-label="Quotation cart">
            <FileText size={18} className={iconColor} strokeWidth={2.25} />
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </Link>
          <button onClick={toggle} className={iconBtnClass} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={18} className={iconColor} strokeWidth={2.25} /> : <Sun size={18} className={iconColor} strokeWidth={2.25} />}
          </button>

          {user ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 pl-3 rounded-xl transition-colors hover:bg-primary/10 dark:hover:bg-white/10 text-charcoal dark:text-white" aria-expanded={profileOpen}>
                <span className="text-sm font-medium max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <div className="w-8 h-8 bg-primary/10 dark:bg-white/15 rounded-lg flex items-center justify-center text-primary dark:text-white font-bold text-sm">{user.name.charAt(0)}</div>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className={`absolute top-full right-0 mt-2 w-48 rounded-xl py-2 z-50 ${dropdownPanel}`}>
                    <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={`block px-4 py-2.5 text-sm ${dropdownLink}`}>Dashboard</Link>
                    <Link to="/dashboard/profile" className={`block px-4 py-2.5 text-sm ${dropdownLink}`}>Profile</Link>
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <LogOut size={14} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-outline btn-sm hidden sm:inline-flex ml-1">Login</Link>
          )}

          <Link to="/quotation" onClick={handleQuotationClick} className="hidden lg:inline-flex btn-primary btn-sm ml-1">Get Quote</Link>

          <button onClick={() => setOpen(!open)} className={`xl:hidden ${iconBtnClass}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={22} className={iconColor} strokeWidth={2.25} /> : <Menu size={22} className={iconColor} strokeWidth={2.25} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-charcoal shadow-lg border-t border-steel/15 dark:border-white/10 p-4">
            <div className="container-custom">
              <div className="input-with-icon">
                <Search size={18} className="input-icon" />
                <input type="text" role="searchbox" inputMode="search" autoComplete="off" placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)}
                  className="input-field" autoFocus aria-label="Search products" />
              </div>
              {results.length > 0 && (
                <div className={`mt-2 rounded-xl overflow-hidden ${dropdownPanel}`}>
                  {results.map(r => (
                    <Link key={r._id} to={`/products/${r.slug}`} onClick={() => setSearchOpen(false)}
                      className={`block px-4 py-3 border-b border-steel/10 dark:border-white/10 last:border-0 text-sm ${dropdownLink}`}>{r.name}</Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 xl:hidden" onClick={() => setOpen(false)} aria-hidden />
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-charcoal z-50 xl:hidden overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-steel/15 dark:border-white/10 flex justify-between items-center">
                <span className="font-bold text-lg text-charcoal dark:text-white">Menu</span>
                <button onClick={() => setOpen(false)} className={iconBtnClass} aria-label="Close">
                  <X size={20} className={iconColor} strokeWidth={2.25} />
                </button>
              </div>
              <nav className="p-4 flex flex-col gap-1" aria-label="Mobile navigation">
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to}
                    className={`px-4 py-3.5 rounded-xl font-medium text-base transition-colors ${isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-charcoal dark:text-white/90 hover:bg-steel/10 dark:hover:bg-white/10 hover:text-primary'}`}>
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-steel/15 dark:border-white/10 mt-4 pt-4 space-y-2">
                  <Link to="/quotation" onClick={handleQuotationClick} className="btn-primary w-full text-center">Request Quotation</Link>
                  {!user ? (
                    <Link to="/login" className="btn-outline w-full text-center">Login</Link>
                  ) : (
                    <>
                      <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-charcoal dark:text-white hover:bg-steel/10 dark:hover:bg-white/10">
                        <User size={18} /> Dashboard
                      </Link>
                      <button onClick={() => { logout(); navigate('/'); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut size={18} /> Logout
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
