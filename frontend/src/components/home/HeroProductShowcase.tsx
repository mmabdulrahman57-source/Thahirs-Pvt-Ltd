import { motion } from 'framer-motion';
import { ShieldCheck, Headphones, Truck, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import genuineProductsImg from '../../assets/genuine-products.png';

const PRODUCT_IMG = genuineProductsImg;

const FLOAT_CARDS: Array<{ text: string; position: string; delay: number; icon: LucideIcon }> = [
  { text: 'Genuine Products', position: 'top-4 -left-2 sm:-left-6', delay: 0.6, icon: ShieldCheck },
  { text: 'Technical Support', position: 'top-1/4 -right-2 sm:-right-8', delay: 0.75, icon: Headphones },
  { text: 'Fast Delivery', position: 'bottom-1/4 -left-1 sm:-left-4', delay: 0.9, icon: Truck },
  { text: 'Trusted Since 1949', position: 'bottom-6 -right-1 sm:-right-6', delay: 1.05, icon: Award },
];

export default function HeroProductShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.25 }}
      className="relative w-full max-w-lg mx-auto lg:max-w-none"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="relative rounded-3xl overflow-hidden hero-product-frame bg-charcoal/60"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-charcoal/30 z-10 pointer-events-none" />
        <img
          src={PRODUCT_IMG}
          alt="Premium industrial valves, pipes and engineering components"
          className="w-full aspect-square sm:aspect-[5/6] object-cover"
          loading="eager"
        />
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-charcoal/90 via-charcoal/60 to-transparent z-10">
          <p className="text-white font-semibold text-sm sm:text-base">Premium Industrial Components</p>
          <p className="text-white/70 text-xs sm:text-sm mt-0.5">
            Valves · Pipes · Boiler Fittings · Engineering Hardware
          </p>
        </div>
      </motion.div>

      {FLOAT_CARDS.map(({ text, position, delay, icon: Icon }) => (
        <motion.div
          key={text}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.5 }}
          className={`absolute ${position} z-20`}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4 + delay, ease: 'easeInOut' }}
            className="hero-float-card flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-charcoal whitespace-nowrap"
          >
            <Icon size={16} className="text-primary shrink-0" strokeWidth={2.25} />
            {text}
          </motion.div>
        </motion.div>
      ))}

      <div className="absolute -inset-4 rounded-[2rem] border border-primary/20 pointer-events-none -z-10" />
    </motion.div>
  );
}
