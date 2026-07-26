import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FadeIn, SectionTitle } from '../components/ui/AnimatedCounter';
import PageHero from '../components/ui/PageHero';
import { getBrands } from '../lib/api';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Array<{ _id: string; name: string; country?: string; featured?: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands().then(setBrands).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero title="Global Brands" subtitle="Sole agents in Sri Lanka for leading international industrial manufacturers"
        badge="Partners" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Brands' }]} />

      <section className="section-padding">
        <div className="container-custom">
          <SectionTitle subtitle="Trusted Partners" title="International Brand Portfolio" />
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brands.map((brand, i) => (
                <FadeIn key={brand._id} delay={i * 0.05} className="h-full">
                  <div className="group card-premium p-8 card-hover card-equal text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                      {brand.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{brand.name}</h3>
                    <p className="text-primary text-sm font-medium mt-1">{brand.country}</p>
                    {brand.featured && <span className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">Sole Agent</span>}
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary">Browse Products by Brand</Link>
          </div>
        </div>
      </section>
    </>
  );
}
