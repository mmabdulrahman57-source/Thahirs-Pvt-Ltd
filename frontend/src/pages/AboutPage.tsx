import { useEffect, useState } from 'react';
import { FadeIn, SectionTitle, AnimatedCounter } from '../components/ui/AnimatedCounter';
import PageHero from '../components/ui/PageHero';
import { COMPANY, TIMELINE, CORE_VALUES } from '../data/company';
import { getTeam } from '../lib/api';
import { Mail, Globe } from 'lucide-react';
import founderPhoto from '../assets/founder.png';
import deenPhoto from '../assets/deen.png';
import kamalPhoto from '../assets/kamal.png';

function teamPhotoSrc(url?: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/')) return url;
  return `/${url}`;
}

export default function AboutPage() {
  const [team, setTeam] = useState<Array<{ _id: string; name: string; position: string; experience?: string; email?: string; linkedin?: string; photo?: string }>>([]);

  useEffect(() => { getTeam().then(setTeam).catch(() => {}); }, []);

  return (
    <>
      <PageHero title="Our Story Since 1949" subtitle="Pioneers in industrial hardware trade, serving Sri Lanka's industries with excellence and integrity"
        badge="About Us" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]} />

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <FadeIn>
            <p className="text-lg leading-relaxed text-charcoal/80 dark:text-white/80">
              {COMPANY.name}, Founded in 1949 by {COMPANY.founder}, has been a trusted supply source to the Industrial Leaders throughout Sri Lanka. Importers, Agents, Stockists and specialists in Steam Boiler fittings, Waterworks Materials, Service Station equipment, Meters & instruments, Pipes, Pipe fittings & Valves for Air Conditioning, Fire systems, Pneumatics, Chemicals, Hydraulic & Insulation Materials.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-light dark:bg-charcoal/50">
        <div className="container-custom">
          <SectionTitle subtitle="History" title="Company Timeline" />
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/30" />
            {TIMELINE.map((item, i) => (
              <FadeIn key={item.year} delay={i * 0.1}>
                <div className="relative pl-20 pb-12 last:pb-0">
                  <div className="absolute left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">{item.year.slice(2)}</div>
                  <div className="glass rounded-xl p-6">
                    <span className="text-primary font-bold">{item.year}</span>
                    <h3 className="font-bold text-lg mt-1">{item.title}</h3>
                    <p className="text-charcoal/70 dark:text-white/70 mt-2">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="w-full max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-xl ring-1 ring-steel/20 dark:ring-white/10 bg-[#5c3d7a]">
              <img
                src={founderPhoto}
                alt={`${COMPANY.founder}, Founder of ${COMPANY.name}`}
                className="w-full h-auto block"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <span className="text-primary font-semibold uppercase tracking-widest">Founder</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">{COMPANY.founder}</h2>
            <p className="text-charcoal/70 dark:text-white/70 leading-relaxed mb-4">
              Al Haj S.M.M. Thahir founded THAHIRS in 1949 with a vision to serve Sri Lanka's growing industrial sector. His commitment to quality, integrity, and customer satisfaction laid the foundation for what would become one of the nation's most trusted industrial hardware suppliers.
            </p>
            <div className="glass rounded-xl p-4 mt-4">
              <h4 className="font-semibold text-primary mb-2">Vision</h4>
              <p className="text-sm text-charcoal/70 dark:text-white/70">To serve industries in Sri Lanka with environmental friendly pipes, valves, and related hardware, manufactured with latest technology, whilst ensuring optimum customer satisfaction.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Chairman & MD Messages */}
      <section className="section-padding bg-light dark:bg-charcoal/50">
        <div className="container-custom grid md:grid-cols-2 gap-8">
          <FadeIn>
            <div className="glass rounded-2xl overflow-hidden h-full">
              <div className="overflow-hidden bg-[#1e4a8a]">
                <img src={deenPhoto} alt="M.T.M.S. Deen, Chairman" className="w-full h-auto block" />
              </div>
              <div className="p-8">
              <h3 className="font-bold text-xl">M.T.M.S. Deen</h3>
              <p className="text-primary text-sm mb-4">Chairman · 30 years experience in Industrial Hardware</p>
              <p className="text-charcoal/70 dark:text-white/70 leading-relaxed text-sm">
                It is with great pleasure that I welcome you to THAHIRS (PVT) LIMITED web site. Our clients are the reason we exist, and we strive to serve them better. Being one of the pioneers in Hardware trade since 1949, THAHIRS finds itself at the forefront in the field of Industrial Hardware. I hope this site provides information on the range of products that we offer and enlightens you on the latest technology and equipment in the market.
              </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="glass rounded-2xl overflow-hidden h-full">
              <div className="overflow-hidden bg-[#1e4a8a]">
                <img src={kamalPhoto} alt="M.T.M. Kamal Pasha, Managing Director" className="w-full h-auto block" />
              </div>
              <div className="p-8">
              <h3 className="font-bold text-xl">M.T.M. Kamal Pasha</h3>
              <p className="text-primary text-sm mb-4">Managing Director · Dip. In BM (NIBM)</p>
              <p className="text-charcoal/70 dark:text-white/70 leading-relaxed text-sm">
                Welcome to the premier Industrial Hardware web site in Sri Lanka. One stop destination for full and complete range of Industrial Hardware. Flexible and dependable with over 50 years experience retaining the traditional values of an old hardware store. We will sell you even one screw if that is all you require or sell you complete plumbing needs for your Project.
              </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <SectionTitle subtitle="Leadership" title="Our Team" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {team.map((member, i) => (
                <FadeIn key={member._id} delay={i * 0.1}>
                  <div className="glass rounded-2xl p-6 text-center card-hover">
                    {member.photo ? (
                      <img
                        src={teamPhotoSrc(member.photo)}
                        alt={member.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover mb-4 border-2 border-primary/20 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-primary mb-4">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-primary text-sm">{member.position}</p>
                    <p className="text-xs text-charcoal/60 dark:text-white/60 mt-1">{member.experience}</p>
                    <div className="flex justify-center gap-3 mt-4">
                      {member.email && <a href={`mailto:${member.email}`} className="p-2 bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-colors"><Mail size={16} /></a>}
                      {member.linkedin && <a href={member.linkedin} className="p-2 bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-colors"><Globe size={16} /></a>}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Core Values */}
      <section className="section-padding bg-light dark:bg-charcoal/50">
        <div className="container-custom">
          <SectionTitle subtitle="Principles" title="Core Values" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_VALUES.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.05}>
                <div className="bg-white dark:bg-charcoal rounded-xl p-6 shadow-lg card-hover">
                  <h3 className="font-bold text-lg text-primary">{v.title}</h3>
                  <p className="text-charcoal/70 dark:text-white/70 mt-2 text-sm">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-primary">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ v: 75, l: 'Years of Excellence', s: '+' }, { v: 10000, l: 'Products', s: '+' }, { v: 5000, l: 'Customers', s: '+' }, { v: 50, l: 'Brands', s: '+' }].map((s, i) => (
            <FadeIn key={s.l} delay={i * 0.1}>
              <AnimatedCounter value={s.v} suffix={s.s} light />
              <p className="text-white text-sm mt-2 font-medium">{s.l}</p>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  );
}
