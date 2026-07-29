import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Globe2, ArrowRight } from 'lucide-react';
import { SectionTitle } from '../ui/AnimatedCounter';
import { STATIC_BRANDS } from '../../data/static';

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

const BrandCard = memo(function BrandCard({ name, country }: { name: string; country?: string }) {
  const flag = country ? COUNTRY_FLAGS[country] : null;

  return (
    <div className="brand-card group flex-shrink-0 w-[200px] sm:w-[220px]">
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-6 text-center transition-[transform,border-color,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[0_12px_40px_-12px_rgba(232,93,4,0.35)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-lg font-bold text-white shadow-md shadow-primary/25 ring-1 ring-white/10">
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
});

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
  brands?: Array<{ _id: string; name: string; country?: string }>;
}

export default function BrandsMarquee({ brands: brandsProp }: BrandsMarqueeProps) {
  const brands = brandsProp?.length ? brandsProp : STATIC_BRANDS;
  const midpoint = Math.ceil(brands.length / 2);
  const rowA = brands.slice(0, midpoint);
  const rowB = brands.slice(midpoint);

  return (
    <section className="relative overflow-hidden bg-charcoal py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12),transparent_55%)]" />

      <div className="container-custom relative z-10">
        <SectionTitle subtitle="Partners" title="Global Brands" light />
        <p className="-mt-6 mb-10 max-w-2xl mx-auto text-center text-sm text-white/60 md:text-base">
          Sole agents in Sri Lanka for world-leading industrial manufacturers — trusted since 1949.
        </p>

        <div className="brand-marquee-mask relative space-y-4">
          <MarqueeRow brands={rowA.length ? rowA : brands} />
          {rowB.length > 0 && <MarqueeRow brands={rowB} reverse />}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-primary/50 hover:bg-primary/20"
          >
            View All Partners <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
