import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    { icon: FileText, title: 'Welcome to THAHIRS Portal', desc: 'You can now submit and track quotation requests online.', time: 'Just now' },
  ];

  return (
    <div className="space-y-3 max-w-2xl">
      {notifications.map((n, i) => (
        <div key={i} className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 p-5 flex gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><n.icon className="text-primary" size={18} /></div>
          <div>
            <div className="font-semibold text-sm">{n.title}</div>
            <div className="text-sm text-charcoal/60 mt-1">{n.desc}</div>
            <div className="text-xs text-charcoal/40 mt-2">{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SupportPage() {
  return (
    <div className="max-w-2xl bg-white dark:bg-charcoal rounded-2xl border border-steel/10 p-8">
      <h2 className="text-xl font-bold mb-4">Contact Support</h2>
      <p className="text-charcoal/70 mb-6">Our team is ready to assist you with product enquiries, quotations, and technical support.</p>
      <div className="space-y-3 text-sm">
        <p><strong>Phone:</strong> +94 11 2424999</p>
        <p><strong>Email:</strong> info@thahirsgroup.com</p>
        <p><strong>Hours:</strong> Monday – Saturday, 8:30 AM – 5:30 PM</p>
      </div>
      <Link to="/contact" className="btn-primary mt-6 inline-flex">Contact Us</Link>
    </div>
  );
}
