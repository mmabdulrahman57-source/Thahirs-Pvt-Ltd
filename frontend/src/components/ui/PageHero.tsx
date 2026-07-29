import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FadeIn } from './AnimatedCounter';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  image?: string;
  imagePosition?: string;
  dark?: boolean;
}

export default function PageHero({ title, subtitle, badge, breadcrumbs, image, imagePosition = 'center', dark = true }: PageHeroProps) {
  return (
    <section className={`page-hero ${dark ? 'page-hero-gradient' : ''} relative`}>
      {image && (
        <>
          <img
            src={image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: imagePosition }}
            loading="eager"
          />
          <div className="page-hero-overlay" />
        </>
      )}
      {!image && dark && (
        <>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </>
      )}
      <div className="page-hero-content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center justify-center gap-2 text-sm text-white/50 mb-4" aria-label="Breadcrumb">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={14} />}
                {b.to ? <Link to={b.to} className="hover:text-primary transition-colors">{b.label}</Link> : <span className="text-white/80">{b.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <FadeIn>
          {badge && <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">{badge}</span>}
          <h1 className="heading-page text-white">{title}</h1>
          {subtitle && <p className="text-white/70 mt-4 max-w-2xl mx-auto text-lg">{subtitle}</p>}
        </FadeIn>
      </div>
    </section>
  );
}
