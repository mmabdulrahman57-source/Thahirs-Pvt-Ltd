import { useState, useEffect } from 'react';
import { MessageCircle, Phone, ArrowUp, Mail, X } from 'lucide-react';
import { COMPANY } from '../../data/company';

const WHATSAPP_URL = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent('Hello THAHIRS, I would like to inquire about your products.')}`;

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  };

  const btnClass = "w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer";

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
      {/* Desktop */}
      <div className="hidden sm:flex flex-col gap-2 pointer-events-auto">
        {showTop && (
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`${btnClass} bg-charcoal text-white hover:bg-primary`}
            aria-label="Back to top">
            <ArrowUp size={20} />
          </button>
        )}
        <a href={`mailto:${COMPANY.email}`} className={`${btnClass} bg-charcoal text-white hover:bg-primary`} aria-label="Email us">
          <Mail size={20} />
        </a>
        <a href={`tel:${COMPANY.phone[0].replace(/\s/g, '')}`} className={`${btnClass} bg-primary text-white`} aria-label="Call us">
          <Phone size={20} />
        </a>
        <button type="button" onClick={openWhatsApp}
          className={`${btnClass} bg-green-500 text-white hover:bg-green-600`}
          aria-label="WhatsApp message">
          <MessageCircle size={20} />
        </button>
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex flex-col items-end gap-2 pointer-events-auto">
        {expanded && (
          <div className="flex flex-col gap-2 mb-1">
            {showTop && (
              <button type="button" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setExpanded(false); }}
                className={`${btnClass} bg-charcoal text-white`} aria-label="Back to top">
                <ArrowUp size={20} />
              </button>
            )}
            <a href={`mailto:${COMPANY.email}`} className={`${btnClass} bg-charcoal text-white`} aria-label="Email">
              <Mail size={20} />
            </a>
            <a href={`tel:${COMPANY.phone[0].replace(/\s/g, '')}`} className={`${btnClass} bg-primary text-white`} aria-label="Call">
              <Phone size={20} />
            </a>
            <button type="button" onClick={() => { openWhatsApp(); setExpanded(false); }}
              className={`${btnClass} bg-green-500 text-white`} aria-label="WhatsApp message">
              <MessageCircle size={20} />
            </button>
          </div>
        )}
        <button type="button" onClick={() => setExpanded(!expanded)}
          className={`${btnClass} ${expanded ? 'bg-charcoal text-white' : 'bg-green-500 text-white'}`}
          aria-label={expanded ? 'Close contact menu' : 'Open WhatsApp & contact options'}>
          {expanded ? <X size={20} /> : <MessageCircle size={20} />}
        </button>
      </div>
    </div>
  );
}
