import { Link } from 'react-router-dom';
import { Globe2, ArrowRight } from 'lucide-react';
import { SectionTitle } from '../ui/AnimatedCounter';

const COUNTRY_FLAGS: Record<string, string> = {
  Japan: '🇯🇵',
  Turkey: '🇹🇷',
  Italy: '🇮🇹',
  China: '🇨🇳',
  UK: '🇬🇧',
  Germany: '🇩🇪',
};

function brandInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function BrandCard({ name, country }: { name: string; country?: string }) {
  const flag = country ? COUNTRY_FLAGS[country] : null;

  return (
    <div className="brand-card group flex-shrink-0 w-[200px] sm:w-[220px]">
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-6 py-6 text-center backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[0_12px_40px_-12px_rgba(232,93,4,0.45)]">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary-dark text-lg font-bold text-white shadow-lg shadow-primary/30 ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-110">
          {brandInitials(name)}
        </div>
        <h3 className="text-base font-bold leading-tight text-white sm:text-lg">{name}</h3>
        {country && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-white/55 sm:text-sm">
            {flag && <span aria-hidden>{flag}</span>}
            {!flag && <Globe2 size={13} className="text-primary/80" />}
            <span>{country}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function MarqueeRow({ brands, reverse = false }: { brands: Array<{ _id: string; name: string; country?: string }>; reverse?: boolean }) {
  if (!brands.length) return null;
  const track = [...brands, ...brands];

  return (
    <div className="brand-marquee-row overflow-hidden py-2">
      <div className={`brand-marquee-track flex w-max gap-5 sm:gap-6 ${reverse ? 'brand-marquee-track--reverse' : ''}`}>
        {track.map((brand, i) => (
          <BrandCard key={`${brand._id}-${i}`} name={brand.name} country={brand.country} />
        ))}
      </div>
    </div>
  );
}

interface BrandsMarqueeProps {
  brands: Array<{ _id: string; name: string; country?: string }>;
}

export default function BrandsMarquee({ brands }: BrandsMarqueeProps) {
  const midpoint = Math.ceil(brands.length / 2);
  const rowA = brands.slice(0, midpoint);
  const rowB = brands.slice(midpoint);

  return (
    <section className="relative overflow-hidden bg-charcoal py-16 md:py-20">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -right-32 bottom-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <SectionTitle subtitle="Partners" title="Global Brands" light />
        <p className="-mt-6 mb-10 max-w-2xl mx-auto text-center text-sm text-white/60 md:text-base">
          Sole agents in Sri Lanka for world-leading industrial manufacturers — trusted since 1949.
        </p>

        {brands.length > 0 ? (
          <div className="brand-marquee-mask relative space-y-4">
            <MarqueeRow brands={rowA.length ? rowA : brands} />
            {rowB.length > 0 && <MarqueeRow brands={rowB} reverse />}
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 w-48 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-white"
          >
            View All Partners <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
