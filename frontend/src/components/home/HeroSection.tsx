import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Award, Package, Users, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { COMPANY } from '../../data/company';
import { useAuth } from '../../context/AuthContext';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import HeroProductShowcase from './HeroProductShowcase';
import heroBg from '../../assets/hero-bg.png';

const HERO_BG = heroBg;

const TRUST_BADGES: Array<{
  value: number;
  suffix: string;
  label: string;
  text?: string;
  icon: LucideIcon;
}> = [
  { value: 75, suffix: '+', label: 'Years of Experience', icon: Award },
  { value: 10000, suffix: '+', label: 'Industrial Products', icon: Package },
  { value: 5000, suffix: '+', label: 'Satisfied Customers', icon: Users },
  { value: 0, suffix: '', label: 'Delivery', text: 'Island-wide', icon: Truck },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' as const },
  }),
};

export default function HeroSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuoteClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      sessionStorage.setItem('thahirs_redirect', '/quotation');
      navigate('/login');
    }
  };

  return (
    <section className="relative -mt-[72px]" aria-label="Hero banner">
      <div className="relative min-h-0 md:min-h-[75vh] lg:min-h-[90vh] flex flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover scale-105 hero-bg-kenburns"
            loading="eager"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/88 to-charcoal/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-charcoal/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 hero-industrial-particles pointer-events-none" aria-hidden />

        <div className="container-custom relative z-10 flex-1 flex flex-col justify-center pt-[88px] pb-10 md:pb-14 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <motion.span
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-primary rounded-full text-sm font-semibold mb-6 border border-primary/30 backdrop-blur-sm"
              >
                <Award size={14} /> Trusted Since {COMPANY.founded} · B2B Industrial Solutions
              </motion.span>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-white mb-5"
              >
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl font-bold tracking-tight leading-[1.1]">
                  Engineering <span className="text-primary">Excellence</span> Since 1949
                </span>
                <span className="block text-base sm:text-lg md:text-xl font-normal mt-3 text-white/75 max-w-xl mx-auto lg:mx-0">
                  Industrial Hardware &amp; Engineering Solutions in Sri Lanka
                </span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Your trusted partner for industrial hardware, valves, piping systems, boiler fittings, pneumatic solutions, and engineering products in Sri Lanka.
              </motion.p>

              <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="sr-only">
                {COMPANY.name} provides premium industrial hardware, valves, pipes, boiler fittings, pneumatic systems, and engineering solutions with over 75 years of trusted experience.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start mb-10"
              >
                <Link
                  to="/quotation"
                  onClick={handleQuoteClick}
                  className="btn-primary text-base px-8 hero-cta-glow justify-center"
                >
                  <FileText size={18} /> Request A Quotation
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[44px] rounded-xl font-semibold text-white border-2 border-white/40 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-charcoal transition-all duration-300 text-base"
                >
                  Explore Products <ArrowRight size={18} />
                </Link>
              </motion.div>

              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
              >
                {TRUST_BADGES.map(badge => (
                  <div key={badge.label} className="hero-trust-badge text-center p-3 sm:p-4 rounded-xl">
                    <badge.icon size={20} className="text-primary mx-auto mb-2" strokeWidth={2} />
                    {badge.text ? (
                      <span className="text-xl sm:text-2xl font-bold text-primary">{badge.text}</span>
                    ) : (
                      <AnimatedCounter value={badge.value} suffix={badge.suffix} compact accent />
                    )}
                    <p className="text-[10px] sm:text-xs text-white/70 mt-1 font-medium leading-tight">{badge.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — product showcase */}
            <div>
              <HeroProductShowcase />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
