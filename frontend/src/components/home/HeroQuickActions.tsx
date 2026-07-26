import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Headphones, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ACTIONS = [
  {
    icon: Package,
    title: 'Need Industrial Products?',
    desc: 'Find high-quality engineering solutions.',
    btn: 'View Products',
    to: '/products',
    variant: 'outline' as const,
  },
  {
    icon: Headphones,
    title: 'Need Technical Support?',
    desc: 'Our experts are ready to help.',
    btn: 'Contact Us',
    to: '/contact',
    variant: 'outline' as const,
  },
  {
    icon: FileText,
    title: 'Need Pricing?',
    desc: 'Get a customised quotation.',
    btn: 'Request Quote',
    to: '/quotation',
    variant: 'primary' as const,
  },
];

export default function HeroQuickActions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuote = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      sessionStorage.setItem('thahirs_redirect', '/quotation');
      navigate('/login');
    }
  };

  return (
    <div className="relative z-10 border-t border-white/10 bg-white/95 dark:bg-charcoal/95 backdrop-blur-xl">
      <div className="container-custom py-8 sm:py-10">
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {ACTIONS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="hero-action-card group p-5 sm:p-6 rounded-2xl"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                <item.icon size={22} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-charcoal dark:text-white mb-1">{item.title}</h3>
              <p className="text-sm text-charcoal/60 dark:text-white/60 mb-4">{item.desc}</p>
              <Link
                to={item.to}
                onClick={item.to === '/quotation' ? handleQuote : undefined}
                className={item.variant === 'primary' ? 'btn-primary btn-sm w-full sm:w-auto' : 'btn-outline btn-sm w-full sm:w-auto'}
              >
                {item.btn} <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
