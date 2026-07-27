import { Link, useLocation } from 'react-router-dom';
import { Home, Info, Package, Mail, Menu } from 'lucide-react';
import { useMobileNav } from '../../context/MobileNavContext';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: Info },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/contact', label: 'Contact', icon: Mail },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { toggleMenu } = useMobileNav();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-[100] bg-white dark:bg-charcoal border-t border-steel/20 dark:border-white/10 safe-area-pb"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-stretch justify-around min-h-[56px]">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-w-0 ${
              isActive(to) ? 'text-primary' : 'text-charcoal/70 dark:text-white/70'
            }`}
          >
            <Icon size={20} strokeWidth={isActive(to) ? 2.5 : 2} />
            <span className="truncate max-w-full px-1">{label}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={toggleMenu}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-charcoal/70 dark:text-white/70 min-w-0"
          aria-label="Open full menu"
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
