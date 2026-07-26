import { useEffect, useMemo, useState } from 'react';
import { Mail, MessageCircle, Save, Send, Clock, FileText } from 'lucide-react';
import type { Quotation, QuotationItem, QuotationCharges, TaxSettings } from '../../../types/quotation';
import { QUOTATION_STATUSES, statusLabel, calcTotals, formatMoney, DEFAULT_TAX_SETTINGS } from '../../../types/quotation';
import { adminSettings } from '../../api';
import { StatusBadge } from '../shared';
import MoneyInput from '../MoneyInput';

interface Props {
  quote: Quotation;
  admins: Array<{ _id: string; name: string }>;
  onSave: (data: Record<string, unknown>, opts?: { sendEmail?: boolean; sendReminder?: boolean }) => Promise<void>;
  onClose: () => void;
}

const emptyCharges: QuotationCharges = { delivery: 0, packing: 0, installation: 0, service: 0, freight: 0, insurance: 0, other: 0 };

function lineTotal(item: QuotationItem) {
  const qty = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const itemDiscount = Number(item.discount) || 0;
  return Math.max(0, qty * unitPrice - itemDiscount);
}

export default function QuotationEditor({ quote, admins, onSave, onClose }: Props) {
  const [tab, setTab] = useState<'customer' | 'pricing' | 'terms' | 'notes' | 'timeline'>('customer');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(quote.status);
  const [priority, setPriority] = useState(quote.priority || 'normal');
  const [assignedTo, setAssignedTo] = useState(quote.assignedTo || '');
  const [items, setItems] = useState<QuotationItem[]>(quote.items || []);
  const [discount, setDiscount] = useState(String(quote.discount || 0));
  const [charges, setCharges] = useState<QuotationCharges>({ ...emptyCharges, ...quote.charges, delivery: quote.charges?.delivery ?? quote.deliveryCharges ?? 0 });
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);
  const [paymentTerms, setPaymentTerms] = useState(quote.paymentTerms || 'Net 30 days');
  const [deliveryTime, setDeliveryTime] = useState(quote.deliveryTime || '7-14 working days');
  const [warranty, setWarranty] = useState(quote.warranty || '12 months manufacturer warranty');
  const [validityPeriod, setValidityPeriod] = useState(String(quote.validityPeriod || 30));
  const [currency, setCurrency] = useState(quote.currency || 'LKR');
  const [incoterms, setIncoterms] = useState(quote.incoterms || '');
  const [customerNotes, setCustomerNotes] = useState(quote.customerNotes || '');
  const [adminNotes, setAdminNotes] = useState(quote.adminNotes || '');
  const [internalNotes, setInternalNotes] = useState(quote.internalNotes || '');
  const [pricingNotes, setPricingNotes] = useState(quote.pricingNotes || '');

  useEffect(() => {
    adminSettings().then(s => {
      const tax = s.tax || DEFAULT_TAX_SETTINGS;
      setTaxSettings({
        vatPercentage: Number(tax.vatPercentage ?? DEFAULT_TAX_SETTINGS.vatPercentage),
        enabled: tax.enabled !== false && tax.enabled !== 'false',
        autoApply: tax.autoApply !== false && tax.autoApply !== 'false',
      });
    }).catch(() => {});
  }, []);

  const totals = useMemo(
    () => calcTotals(items, parseFloat(discount) || 0, charges, taxSettings),
    [items, discount, charges, taxSettings],
  );

  const buildPayload = () => ({
    status, priority, assignedTo,
    items: totals.items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    netAmount: totals.netAmount,
    vatPercentage: totals.vatPercentage,
    vat: totals.vat,
    vatAmount: totals.vatAmount,
    deliveryCharges: charges.delivery || 0,
    charges,
    totalAmount: totals.totalAmount,
    paymentTerms, deliveryTime, warranty,
    validityPeriod: parseInt(validityPeriod) || 30, currency, incoterms,
    customerNotes, adminNotes, internalNotes, pricingNotes,
  });

  const save = async (opts?: { sendEmail?: boolean; sendReminder?: boolean; statusOverride?: string }) => {
    setSaving(true);
    try {
      await onSave({ ...buildPayload(), status: opts?.statusOverride || status, sendEmail: opts?.sendEmail, sendReminder: opts?.sendReminder });
    } finally { setSaving(false); }
  };

  const updateItem = (i: number, field: keyof QuotationItem, val: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const c = quote.customer;
  const tabs = ['customer', 'pricing', 'terms', 'notes', 'timeline'] as const;
  const vatLabel = `VAT (${totals.vatPercentage || 18}%)`;
  const whatsappText = encodeURIComponent(
    `Your quotation ${quote.reference} from THAHIRS\nSubtotal: ${formatMoney(totals.subtotal, currency)}\nDiscount: ${formatMoney(totals.discount, currency)}\nNet Amount: ${formatMoney(totals.netAmount, currency)}\n${vatLabel}: ${formatMoney(totals.vatAmount, currency)}\nGrand Total: ${formatMoney(totals.totalAmount, currency)}`,
  );

  return (
    <div className="space-y-4 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-steel/10">
        <div>
          <div className="font-bold text-lg text-primary">{quote.reference}</div>
          <div className="text-sm text-charcoal/60">v{quote.version || 1.0} · {new Date(quote.createdAt).toLocaleString()}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-wrap gap-1 border-b border-steel/10 pb-2">
        {tabs.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${tab === t ? 'bg-primary text-white' : 'hover:bg-steel/10'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'customer' && (
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-steel/5 rounded-xl space-y-1">
            <div className="font-semibold mb-2">Contact Information</div>
            <div><strong>Name:</strong> {c.name}</div>
            <div><strong>Company:</strong> {c.company || '—'}</div>
            <div><strong>Email:</strong> {c.email}</div>
            <div><strong>Phone:</strong> {c.phone || '—'}</div>
            <div><strong>WhatsApp:</strong> {c.whatsapp || '—'}</div>
          </div>
          <div className="p-3 bg-steel/5 rounded-xl">
            <div className="font-semibold mb-2">Requested Products ({items.length})</div>
            {items.map((item, i) => (
              <div key={i} className="py-2 border-b border-steel/10 last:border-0 text-xs">
                <div className="font-medium">{item.productName}</div>
                <div className="text-charcoal/60">Qty: {item.quantity} {item.unit} {item.preferredBrand && `· Brand: ${item.preferredBrand}`}</div>
                {item.description && <div className="text-charcoal/50">{item.description}</div>}
                {item.specialNotes && <div className="text-charcoal/50 italic">Note: {item.specialNotes}</div>}
              </div>
            ))}
          </div>
          {quote.customerHistory && quote.customerHistory.length > 0 && (
            <div className="md:col-span-2 p-3 bg-steel/5 rounded-xl">
              <div className="font-semibold mb-2">Previous Quotations</div>
              {quote.customerHistory.map(h => (
                <div key={h._id} className="text-xs py-1 flex justify-between"><span>{h.reference}</span><StatusBadge status={h.status} /></div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'pricing' && (
        <div className="space-y-3">
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-charcoal/70">
            VAT at <strong>{totals.vatPercentage || 18}%</strong> is applied automatically on the net amount after discount.
          </div>

          {items.map((item, i) => (
            <div key={i} className="p-3 border border-steel/15 rounded-xl text-sm grid md:grid-cols-5 gap-2 items-end">
              <div className="md:col-span-2">
                <div className="font-medium">{item.productName}</div>
                <div className="text-xs text-charcoal/50">{item.quantity} {item.unit}</div>
              </div>
              <div>
                <label className="text-[10px] font-medium">Unit Price</label>
                <MoneyInput value={item.unitPrice} onChange={v => updateItem(i, 'unitPrice', v)} placeholder="1500.00" />
                <p className="text-[9px] text-charcoal/45 mt-0.5">Type amount, e.g. 1500 or 1500.00</p>
              </div>
              <div>
                <label className="text-[10px] font-medium">Line Discount</label>
                <MoneyInput value={item.discount} onChange={v => updateItem(i, 'discount', v)} placeholder="0.00" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-medium text-charcoal/50 mb-1">Line Total</div>
                <div className="font-semibold text-primary">{formatMoney(lineTotal(item), currency)}</div>
              </div>
            </div>
          ))}

          <div className="grid md:grid-cols-2 gap-2">
            {(['delivery', 'service'] as const).map(k => (
              <div key={k}>
                <label className="text-xs font-medium capitalize">{k} Charges</label>
                <MoneyInput value={charges[k]} onChange={v => setCharges({ ...charges, [k]: v })} placeholder="0.00" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium">Overall Discount</label>
            <MoneyInput value={parseFloat(discount) || 0} onChange={v => setDiscount(String(v))} placeholder="0.00" />
          </div>

          <div className="p-4 bg-primary/5 rounded-xl text-sm space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(totals.subtotal, currency)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>{formatMoney(totals.discount, currency)}</span></div>
            <div className="flex justify-between font-medium"><span>Net Amount</span><span>{formatMoney(totals.netAmount, currency)}</span></div>
            <div className="flex justify-between">
              <span>{vatLabel}</span>
              <input type="text" readOnly value={formatMoney(totals.vatAmount, currency)} className="input-field text-sm text-right bg-steel/10 cursor-not-allowed max-w-[180px]" aria-label={vatLabel} />
            </div>
            <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t border-primary/20">
              <span>Grand Total</span><span>{formatMoney(totals.totalAmount, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'terms' && (
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div><label className="text-xs font-medium">Payment Terms</label><input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="input-field text-sm" /></div>
          <div><label className="text-xs font-medium">Delivery Period</label><input value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="input-field text-sm" /></div>
          <div><label className="text-xs font-medium">Warranty</label><input value={warranty} onChange={e => setWarranty(e.target.value)} className="input-field text-sm" /></div>
          <div><label className="text-xs font-medium">Validity (days)</label><input type="number" value={validityPeriod} onChange={e => setValidityPeriod(e.target.value)} className="input-field text-sm" /></div>
          <div><label className="text-xs font-medium">Currency</label><input value={currency} onChange={e => setCurrency(e.target.value)} className="input-field text-sm" /></div>
          <div><label className="text-xs font-medium">Incoterms</label><input value={incoterms} onChange={e => setIncoterms(e.target.value)} className="input-field text-sm" placeholder="EXW, FOB, CIF..." /></div>
          <div className="md:col-span-2"><label className="text-xs font-medium">Notes to Customer</label><textarea value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} className="input-field text-sm resize-none" rows={2} /></div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-3 text-sm">
          <div><label className="text-xs font-medium">Internal Notes (Admin only)</label><textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} className="input-field text-sm resize-none" rows={2} /></div>
          <div><label className="text-xs font-medium">Pricing Notes</label><textarea value={pricingNotes} onChange={e => setPricingNotes(e.target.value)} className="input-field text-sm resize-none" rows={2} /></div>
          <div><label className="text-xs font-medium">Admin Notes</label><textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="input-field text-sm resize-none" rows={2} /></div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {(quote.timeline || []).length === 0 ? <p className="text-sm text-charcoal/50">No activity yet</p> :
            (quote.timeline || []).slice().reverse().map((t, i) => (
              <div key={i} className="flex gap-3 text-sm p-2 border-l-2 border-primary/30 pl-3">
                <Clock size={14} className="text-primary shrink-0 mt-0.5" />
                <div><div className="font-medium">{t.message}</div><div className="text-xs text-charcoal/50">{t.userName} · {new Date(t.timestamp).toLocaleString()}</div></div>
              </div>
            ))}
          {quote.revisions && quote.revisions.length > 0 && (
            <div className="mt-3"><div className="font-semibold text-sm mb-1">Revisions</div>
              {quote.revisions.map((r, i) => <div key={i} className="text-xs text-charcoal/60">v{r.version} — {r.editedByName} — {new Date(r.date).toLocaleDateString()}</div>)}
            </div>
          )}
        </div>
      )}

      <div className="sticky bottom-0 -mx-6 px-6 py-4 mt-2 bg-white dark:bg-charcoal border-t border-steel/15 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] space-y-4 z-20">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal/80 dark:text-white/80">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-field text-sm bg-white dark:bg-charcoal/80">
              {QUOTATION_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal/80 dark:text-white/80">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field text-sm bg-white dark:bg-charcoal/80">
              {['low', 'normal', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-charcoal/80 dark:text-white/80">Sales Representative</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="input-field text-sm bg-white dark:bg-charcoal/80">
              <option value="">Unassigned</option>
              {admins.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => save()} className="btn-outline text-sm flex items-center gap-1"><Save size={14} /> Save Draft</button>
          <button type="button" disabled={saving} onClick={() => save({ statusOverride: 'price_added' })} className="btn-outline text-sm flex items-center gap-1"><FileText size={14} /> Save Pricing</button>
          <button type="button" disabled={saving} onClick={() => save({ sendEmail: true, statusOverride: 'sent_to_customer' })} className="btn-primary text-sm flex items-center gap-1"><Send size={14} /> Send to Customer</button>
          <button type="button" disabled={saving} onClick={() => save({ sendReminder: true })} className="btn-outline text-sm flex items-center gap-1"><Mail size={14} /> Send Reminder</button>
          <a href={`https://wa.me/${(c.whatsapp || c.phone || '').replace(/\D/g, '')}?text=${whatsappText}`} target="_blank" rel="noreferrer" className="btn-outline text-sm flex items-center gap-1"><MessageCircle size={14} /> WhatsApp</a>
          <button type="button" onClick={onClose} className="btn-outline text-sm ml-auto">Close</button>
        </div>
      </div>
    </div>
  );
}
