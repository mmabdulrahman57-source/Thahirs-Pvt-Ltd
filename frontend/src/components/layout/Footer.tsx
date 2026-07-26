import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Share2, Globe } from 'lucide-react';
import { COMPANY } from '../../data/company';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="section-padding pb-8">
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Logo size="md" className="rounded-lg bg-white" />
              <div>
                <div className="font-bold text-lg">THAHIRS (PVT) LTD</div>
                <div className="text-primary text-sm">Since 1949</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Trusted industrial hardware supplier in Sri Lanka. Importers, agents, stockists and specialists in steam boiler fittings, valves, pipes, and industrial equipment.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {['/', '/about', '/products', '/services', '/gallery', '/contact', '/quotation'].map((path, i) => (
                <li key={path}><Link to={path} className="hover:text-primary transition-colors">
                  {['Home', 'About Us', 'Products', 'Services', 'Gallery', 'Contact', 'Request Quote'][i]}
                </Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Products</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {['Steam Boiler Fittings', 'Industrial Valves', 'Waterworks Materials', 'Pneumatic Systems', 'Meters & Instruments', 'Packing & Insulation'].map(item => (
                <li key={item}><Link to="/products" className="hover:text-primary transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2"><MapPin size={16} className="text-primary mt-0.5 shrink-0" />{COMPANY.address}</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-primary shrink-0" />{COMPANY.phone[0]}</li>
              <li className="flex items-center gap-2"><Mail size={16} className="text-primary shrink-0" />{COMPANY.email}</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-primary transition-colors"><Share2 size={18} /></a>
              <a href="https://lk.linkedin.com/company/thahirs" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-primary transition-colors"><Globe size={18} /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} THAHIRS (PVT) LTD. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
