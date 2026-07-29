import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { FadeIn } from '../components/ui/AnimatedCounter';
import PageHero from '../components/ui/PageHero';
import productsHeroImg from '../assets/products-hero.png';
import { getProducts, getCategories, getBrands } from '../lib/api';
import { useQuotation } from '../context/QuotationContext';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

interface Product {
  _id: string; name: string; slug: string; description?: string;
  category?: { _id: string; name: string }; brand?: { _id: string; name: string };
  tags?: string[]; featured?: boolean; image?: string; images?: string[];
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const { addItem } = useQuotation();

  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (brand) params.brand = brand;
    if (search) params.search = search;
    getProducts(params).then(d => setProducts(d.products || d)).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [category, brand, search]);

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };

  return (
    <>
      <PageHero
        title="Product Catalogue"
        subtitle="Complete range of industrial hardware from world-class brands"
        image={productsHeroImg}
        imagePosition="center right"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
      />

      <section className="section-padding">
        <div className="container-custom">

          <div className="bg-white dark:bg-charcoal rounded-2xl p-5 sm:p-6 mb-8 border border-steel/10 shadow-sm">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2 input-with-icon">
                <Search className="input-icon" size={18} />
                <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                  className="input-field" aria-label="Search products" />
              </div>
              <select value={category} onChange={e => updateFilter('category', e.target.value)} className="input-field">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select value={brand} onChange={e => updateFilter('brand', e.target.value)} className="input-field">
                <option value="">All Brands</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-charcoal/60"><Filter size={48} className="mx-auto mb-4 opacity-30" /><p>No products found. Try adjusting your filters.</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <FadeIn key={product._id} delay={i * 0.05} className="h-full">
                  <div className="card-premium card-hover group card-equal">
                    <div className="h-48 img-placeholder relative overflow-hidden shrink-0">
                      {(product.image || product.images?.[0]) ? (
                        <img src={product.image || product.images![0]} alt={product.name} className="img-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="text-5xl opacity-20">⚙️</div>
                      )}
                      {product.featured && <span className="absolute top-3 left-3 badge bg-primary text-white">Featured</span>}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      {product.brand && <span className="text-xs text-primary font-semibold">{product.brand.name}</span>}
                      <h3 className="font-bold text-lg mt-1 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-charcoal/60 dark:text-white/60 mt-2 line-clamp-2 flex-1">{product.description}</p>
                      {product.category && <span className="inline-block mt-3 badge badge-primary w-fit">{product.category.name}</span>}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-steel/10">
                        <Link to={`/products/${product.slug}`} className="flex-1 text-center py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-colors min-h-[44px] flex items-center justify-center">View Details</Link>
                        <button onClick={() => { addItem({ productName: product.name, productId: product._id, quantity: 1, unit: 'pcs' }); toast.success('Added to quotation'); }}
                          className="p-2.5 min-w-[44px] min-h-[44px] bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center" title="Add to Quotation" aria-label="Add to quotation">
                          <FileText size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
