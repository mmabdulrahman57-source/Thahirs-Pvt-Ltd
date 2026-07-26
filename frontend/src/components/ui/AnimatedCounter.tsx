import { useEffect, useRef, useState } from 'react';
import { useInView, motion } from 'framer-motion';

export function AnimatedCounter({ value, suffix = '', text, light = false, compact = false, accent = false, className = '' }: {
  value: number; suffix?: string; text?: string; light?: boolean; compact?: boolean; accent?: boolean; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  const sizeClass = compact ? 'text-xl sm:text-2xl' : 'text-4xl md:text-5xl';
  const colorClass = light ? 'text-white drop-shadow-sm' : accent ? 'text-primary' : 'gradient-text';

  return (
    <span ref={ref} className={`font-bold ${sizeClass} ${colorClass} ${className}`}>
      {text || `${count.toLocaleString()}${suffix}`}
    </span>
  );
}

export function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ subtitle, title, light = false }: { subtitle?: string; title: string; light?: boolean }) {
  return (
    <div className="text-center mb-12">
      {subtitle && <span className={`font-semibold text-sm uppercase tracking-widest ${light ? 'text-primary-light' : 'text-primary'}`}>{subtitle}</span>}
      <h2 className={`text-3xl md:text-4xl font-bold mt-2 ${light ? 'text-white' : 'text-charcoal dark:text-white'}`}>{title}</h2>
      <div className={`w-20 h-1 mx-auto mt-4 rounded-full ${light ? 'bg-white' : 'bg-primary'}`} />
    </div>
  );
}
