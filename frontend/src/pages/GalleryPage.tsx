import { useEffect, useState } from 'react';
import { FadeIn } from '../components/ui/AnimatedCounter';
import PageHero from '../components/ui/PageHero';
import { getGallery } from '../lib/api';

const tabs = ['all', 'office', 'warehouse', 'store', 'projects', 'products'];

export default function GalleryPage() {
  const [items, setItems] = useState<Array<{ _id: string; title: string; url: string; category: string }>>([]);
  const [active, setActive] = useState('all');

  useEffect(() => {
    getGallery(active === 'all' ? undefined : active).then(setItems).catch(() => {});
  }, [active]);

  return (
    <>
      <PageHero title="Gallery" subtitle="Explore our office, warehouse, and project portfolio"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Gallery' }]} />

      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActive(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${active === tab ? 'bg-primary text-white' : 'bg-steel/20 hover:bg-primary/10'}`}>
                {tab === 'all' ? 'All' : tab}
              </button>
            ))}
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {items.map((item, i) => (
              <FadeIn key={item._id} delay={i * 0.05}>
                <div className="break-inside-avoid rounded-2xl overflow-hidden shadow-lg card-hover group">
                  <img src={item.url} alt={item.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="p-3 bg-white dark:bg-charcoal">
                    <p className="font-semibold text-sm">{item.title}</p>
                    <span className="text-xs text-primary capitalize">{item.category}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
