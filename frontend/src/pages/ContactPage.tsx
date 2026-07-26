import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Headphones, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { FadeIn } from '../components/ui/AnimatedCounter';
import PageHero from '../components/ui/PageHero';
import { COMPANY } from '../data/company';
import { submitContact } from '../lib/api';

const departments = [
  { icon: Phone, title: 'Sales', contact: '+94 11 2424999', email: 'info@thahirsgroup.com' },
  { icon: Wrench, title: 'Technical Support', contact: '+94 11 2421076', email: 'info@thahirsgroup.com' },
  { icon: Headphones, title: 'Customer Service', contact: '+94 11 2424999', email: 'info@thahirsgroup.com' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContact(form);
      toast.success('Message sent! We will respond shortly.');
      setForm({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
    } catch { toast.error('Failed to send. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageHero title="Contact Us" subtitle="We're here to help with your industrial hardware needs"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />

      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-3 gap-8 mb-12">
          {departments.map((dept, i) => (
            <FadeIn key={dept.title} delay={i * 0.1}>
              <div className="card-premium p-6 text-center card-equal h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <dept.icon className="text-primary" size={22} />
                </div>
                <h3 className="font-bold mb-2">{dept.title}</h3>
                <p className="text-sm text-charcoal/60">{dept.contact}</p>
                <p className="text-sm text-primary mt-1">{dept.email}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="container-custom grid lg:grid-cols-2 gap-12">
          <FadeIn>
            <div className="space-y-6">
              {[
                { icon: MapPin, label: 'Address', value: COMPANY.address },
                { icon: Phone, label: 'Phone', value: COMPANY.phone.join(' / ') },
                { icon: Mail, label: 'Email', value: COMPANY.email },
                { icon: Clock, label: 'Business Hours', value: COMPANY.hours },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"><Icon className="text-primary" size={20} /></div>
                  <div><div className="font-semibold">{label}</div><div className="text-charcoal/70 dark:text-white/70 text-sm">{value}</div></div>
                </div>
              ))}
              <button type="button" onClick={() => window.open(`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent('Hello THAHIRS, I would like to get in touch.')}`, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                <MessageCircle size={18} /> WhatsApp Us
              </button>
              <div className="rounded-2xl overflow-hidden h-64 shadow-lg border border-steel/10">
                <iframe src={COMPANY.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="THAHIRS Location" />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="card-premium p-6 sm:p-8 space-y-4">
              <h2 className="heading-section text-2xl">Quick Contact</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group"><label className="text-label text-required">Your Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
                <div className="form-group"><label className="text-label text-required">Email</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group"><label className="text-label">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
                <div className="form-group"><label className="text-label">Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="input-field" /></div>
              </div>
              <div className="form-group"><label className="text-label">Subject</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input-field" /></div>
              <div className="form-group"><label className="text-label text-required">Message</label><textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input-field resize-none" /></div>
              <button type="submit" disabled={loading} className="btn-primary w-full"><Send size={18} /> {loading ? 'Sending...' : 'Send Message'}</button>
            </form>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
