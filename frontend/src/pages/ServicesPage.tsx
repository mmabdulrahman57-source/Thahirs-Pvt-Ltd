import { Wrench, Headphones, Truck, Settings, Shield, Package, MapPin } from 'lucide-react';
import { FadeIn, SectionTitle } from '../components/ui/AnimatedCounter';
import PageHero from '../components/ui/PageHero';
import { SERVICES } from '../data/company';
import { Link } from 'react-router-dom';

const icons = [Wrench, Headphones, Package, Settings, Shield, Truck, MapPin];

export default function ServicesPage() {
  return (
    <>
      <PageHero title="Our Services" subtitle="Comprehensive industrial solutions from consultation to after-sales support"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]} />

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => {
              const Icon = icons[i] || Wrench;
              return (
                <FadeIn key={service.title} delay={i * 0.05} className="h-full">
                  <div className="card-premium p-8 card-hover card-equal">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="text-primary" size={28} />
                    </div>
                    <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                    <p className="text-charcoal/70 dark:text-white/70">{service.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <SectionTitle title="Ready to Get Started?" light />
          <p className="text-white/80 mb-8 -mt-8">Contact our team for expert industrial consultation</p>
          <Link to="/contact" className="inline-flex px-8 py-4 bg-white text-primary font-bold rounded-xl hover:shadow-xl transition-all">Contact Us Today</Link>
        </div>
      </section>
    </>
  );
}
