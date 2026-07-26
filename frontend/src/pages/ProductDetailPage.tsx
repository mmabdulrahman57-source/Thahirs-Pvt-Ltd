import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { FadeIn } from '../components/ui/AnimatedCounter';
import { getProduct } from '../lib/api';
import { useQuotation } from '../context/QuotationContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState<{ product: Record<string, unknown>; related: Array<Record<string, unknown>> } | null>(null);
  const { addItem } = useQuotation();

  useEffect(() => {
    if (slug) getProduct(slug).then(setData).catch(() => setData(null));
  }, [slug]);

  if (!data) return (
    <div className="section-padding container-custom text-center">
      <div className="animate-pulse h-96 bg-steel/20 rounded-2xl" />
    </div>
  );

  const { product, related } = data;
  const specs = (product.specifications as Array<{ key: string; value: string }>) || [];
  const images = (product.images as string[] | undefined)?.filter(Boolean) || [];
  const mainImage = (product.image as string) || images[0] || '';

  return (
    <section className="section-padding">
      <div className="container-custom">
        <Link to="/products" className="inline-flex items-center gap-2 text-primary mb-6 hover:underline"><ArrowLeft size={18} /> Back to Products</Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <FadeIn>
            <div className="card-premium overflow-hidden">
              {mainImage ? (
                <img src={mainImage} alt={product.name as string} className="w-full h-80 sm:h-96 object-cover" loading="lazy" />
              ) : (
                <div className="h-80 sm:h-96 img-placeholder">
                  <div className="text-8xl opacity-30">⚙️</div>
                </div>
              )}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map(url => (
                    <img key={url} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-steel/20 shrink-0" />
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            {(product.brand as { name: string })?.name && (
              <span className="text-primary font-semibold">{(product.brand as { name: string }).name}</span>
            )}
            <h1 className="heading-section mt-1">{product.name as string}</h1>
            <p className="text-body mt-4">{product.description as string}</p>

            {specs.length > 0 && (
              <div className="mt-6 card-premium p-5">
                <h3 className="font-bold mb-3">Technical Specifications</h3>
                <div className="space-y-2">
                  {specs.map(s => (
                    <div key={s.key} className="flex justify-between text-sm border-b border-steel/20 pb-2">
                      <span className="text-charcoal/60 dark:text-white/60">{s.key}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => addItem({ productName: product.name as string, productId: product._id as string, quantity: 1, unit: 'pcs' })}
                className="btn-primary"><FileText size={18} /> Request Quotation</button>
              {product.datasheet ? (
                <a href={String(product.datasheet)} className="btn-outline" download><Download size={18} /> Download Datasheet</a>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle size={16} /> Available for island-wide delivery
            </div>
          </FadeIn>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {related.map(r => (
                <Link key={r._id as string} to={`/products/${r.slug}`} className="card-premium p-4 card-hover block">
                  <h3 className="font-semibold text-sm hover:text-primary">{r.name as string}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
