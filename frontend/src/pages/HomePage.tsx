import { useEffect, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Droplets, Cylinder, GitBranch, Settings, Wind, Gauge, Activity,
  Shield, Layers, Fuel, FlaskConical, ChevronRight, Star, CheckCircle,
  Factory, HardHat, Building2, Hotel, HeartPulse, Zap, Landmark, Wrench,
} from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import BrandsMarquee from '../components/home/BrandsMarquee';
import since1949Img from '../assets/since-1949.png';
import { AnimatedCounter, FadeIn, SectionTitle } from '../components/ui/AnimatedCounter';
import { HIGHLIGHTS, WHY_CHOOSE, INDUSTRIES, FAQ } from '../data/company';
import { STATIC_CATEGORIES, STATIC_BRANDS } from '../data/static';
import { getCategories, getBrands, getTestimonials, getProjects } from '../lib/api';

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Flame, Droplets, Cylinder, GitBranch, Settings, Wind, Gauge, Activity, Shield, Layers, Fuel, FlaskConical,
};

const industryIcons: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Manufacturing: Factory,
  Construction: HardHat,
  'Water Supply': Droplets,
  Hotels: Hotel,
  Hospitals: HeartPulse,
  'Power Plants': Zap,
  Factories: Building2,
  'Oil & Gas': Fuel,
  'Government Projects': Landmark,
  'Engineering Contractors': Wrench,
};

export default function HomePage() {
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [brands, setBrands] = useState(STATIC_BRANDS);
  const [testimonials, setTestimonials] = useState<Array<{ _id: string; name: string; company?: string; content: string; rating: number }>>([]);
  const [projects, setProjects] = useState<Array<{ _id: string; title: string; description?: string; industry?: string; images?: string[] }>>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      getCategories().then(setCategories).catch(() => {}),
      getBrands().then(setBrands).catch(() => {}),
      getTestimonials().then(setTestimonials).catch(() => {}),
      getProjects().then(setProjects).catch(() => {}),
    ]);
  }, []);

  return (
    <>
      <HeroSection />

      {/* Counters */}
      <section className="section-padding bg-primary">
        <div className="container-custom grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {HIGHLIGHTS.map((h, i) => (
            <FadeIn key={h.label} delay={i * 0.1} className="text-center">
              <AnimatedCounter value={h.value} suffix={h.suffix} text={h.text} light />
              <p className="text-white text-sm mt-2 font-medium">{h.label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src={since1949Img} alt="THAHIRS industrial hardware — valves, fittings and engineering components" className="w-full h-[400px] object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <div className="text-3xl font-bold">Since 1949</div>
                <div className="text-primary">Colombo, Sri Lanka</div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">About Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Sri Lanka's Most Trusted Industrial Hardware Supplier</h2>
            <p className="text-charcoal/70 dark:text-white/70 leading-relaxed mb-6">
              Founded in 1949, THAHIRS (PVT) LTD has become one of Sri Lanka's most trusted industrial hardware suppliers. We provide world-class engineering products, industrial valves, pipes, fittings, boiler accessories, pneumatic systems, waterworks materials, insulation products, and industrial equipment to industries across the country.
            </p>
            <Link to="/about" className="btn-primary">Read More <ChevronRight size={18} /></Link>
          </FadeIn>
        </div>
      </section>

      {/* Product Categories */}
      <section className="section-padding bg-light dark:bg-charcoal/50">
        <div className="container-custom">
          <SectionTitle subtitle="Our Products" title="Featured Product Categories" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat, i) => {
              const Icon = iconMap[cat.icon || 'Settings'] || Settings;
              return (
                <FadeIn key={cat._id} delay={i * 0.05} className="h-full">
                  <Link to={`/products?category=${cat._id}`} className="group block card-premium p-6 card-hover card-equal">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon className="text-primary group-hover:text-white transition-colors" size={28} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-sm text-charcoal/60 dark:text-white/60 line-clamp-2">{cat.description}</p>
                    <div className="flex gap-2 mt-4">
                      <span className="text-xs text-primary font-semibold">Quick View →</span>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionTitle subtitle="Why THAHIRS" title="Why Choose Us" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {WHY_CHOOSE.map((item, i) => (
              <FadeIn key={item} delay={i * 0.05}>
                <div className="glass rounded-xl p-4 text-center card-hover">
                  <CheckCircle className="text-primary mx-auto mb-2" size={24} />
                  <p className="text-sm font-semibold">{item}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <BrandsMarquee brands={brands} />

      {/* Industries */}
      <section className="section-padding bg-light dark:bg-charcoal/50">
        <div className="container-custom">
          <SectionTitle subtitle="Sectors" title="Industries We Serve" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {INDUSTRIES.map((ind, i) => {
              const IndIcon = industryIcons[ind] || Factory;
              return (
              <FadeIn key={ind} delay={i * 0.05}>
                <div className="card-premium p-5 text-center card-hover card-equal">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <IndIcon className="text-primary" size={24} />
                  </div>
                  <p className="font-semibold text-sm">{ind}</p>
                </div>
              </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <SectionTitle subtitle="Testimonials" title="What Our Clients Say" />
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <FadeIn key={t._id} delay={i * 0.1}>
                  <div className="glass rounded-2xl p-6 card-hover">
                    <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} className="text-primary fill-primary" />)}</div>
                    <p className="text-charcoal/70 dark:text-white/70 italic mb-4">"{t.content}"</p>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-primary">{t.company}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="section-padding bg-light dark:bg-charcoal/50">
          <div className="container-custom">
            <SectionTitle subtitle="Portfolio" title="Latest Projects" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.slice(0, 4).map((p, i) => (
                <FadeIn key={p._id} delay={i * 0.1}>
                  <div className="rounded-2xl overflow-hidden shadow-lg card-hover bg-white dark:bg-charcoal">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-charcoal/20 flex items-center justify-center">
                        <Settings size={48} className="text-primary/50" />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs text-primary font-semibold">{p.industry}</span>
                      <h3 className="font-bold mt-1">{p.title}</h3>
                      <p className="text-sm text-charcoal/60 dark:text-white/60 mt-2 line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <SectionTitle subtitle="FAQ" title="Frequently Asked Questions" />
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="glass rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center p-5 text-left font-semibold hover:bg-primary/5 transition-colors">
                    {f.q}
                    <ChevronRight size={20} className={`transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                  </button>
                  {openFaq === i && <div className="px-5 pb-5 text-charcoal/70 dark:text-white/70">{f.a}</div>}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Need Industrial Solutions?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Our experienced engineering team is ready to help you find the right products for your project.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-xl hover:shadow-xl transition-all">Contact Us</Link>
            <Link to="/quotation" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-primary transition-all">Request Quotation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
