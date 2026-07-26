import { useEffect, useState } from 'react';
import { Download, Eye, CheckCircle, XCircle, MessageSquare, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyQuotations, downloadQuotationPdf, respondToQuotation, markQuotationViewed } from '../../lib/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { canCustomerSeePricing, statusLabel, normalizeStatus, formatMoney } from '../../types/quotation';

const statusColors: Record<string, string> = {
  new_request: 'bg-blue-100 text-blue-800', under_review: 'bg-indigo-100 text-indigo-800',
  awaiting_pricing: 'bg-yellow-100 text-yellow-800', price_added: 'bg-cyan-100 text-cyan-800',
  sent_to_customer: 'bg-green-100 text-green-800', customer_viewed: 'bg-emerald-100 text-emerald-800',
  customer_accepted: 'bg-green-100 text-green-900', customer_rejected: 'bg-red-100 text-red-800',
  completed: 'bg-purple-100 text-purple-800', cancelled: 'bg-steel/30 text-charcoal/60',
  pending: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800',
};

export default function MyQuotations() {
  const [quotes, setQuotes] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [responding, setResponding] = useState<string | null>(null);

  const load = () => getMyQuotations().then(setQuotes).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleExpand = async (id: string, status: string) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next && canCustomerSeePricing(status)) {
      try { await markQuotationViewed(id); } catch { /* ignore */ }
    }
  };

  const handleDownload = async (id: string, ref: string) => {
    try {
      const blob = await downloadQuotationPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${ref}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('PDF not available yet'); }
  };

  const handleRespond = async (id: string, action: 'accept' | 'reject' | 'revision') => {
    setResponding(id);
    try {
      await respondToQuotation(id, action, responseMsg);
      toast.success(action === 'accept' ? 'Quotation accepted!' : action === 'reject' ? 'Quotation rejected' : 'Revision requested');
      setResponseMsg(''); setExpanded(null); load();
    } catch { toast.error('Action failed'); }
    finally { setResponding(null); }
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">My Quotation Requests</h2>
        <a href="/quotation" className="btn-primary text-sm py-2">New Request</a>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white dark:bg-charcoal rounded-2xl p-12 text-center border border-steel/10">
          <p className="text-charcoal/50 mb-4">No quotation requests yet.</p>
          <a href="/quotation" className="text-primary font-semibold hover:underline">Submit your first request →</a>
        </div>
      ) : quotes.map(q => {
        const status = normalizeStatus(q.status as string);
        const showPricing = canCustomerSeePricing(status);
        const canRespond = ['sent_to_customer', 'customer_viewed'].includes(status);
        const items = (q.items as Array<Record<string, unknown>>) || [];

        return (
          <div key={q._id as string} className="bg-white dark:bg-charcoal rounded-2xl border border-steel/10 overflow-hidden">
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-bold text-primary">{q.reference as string}</div>
                <div className="text-sm text-charcoal/60">{new Date(q.createdAt as string).toLocaleDateString()} · {items.length} items</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-steel/20'}`}>{statusLabel(status)}</span>
                <button onClick={() => handleExpand(q._id as string, status)} className="p-2 rounded-lg hover:bg-primary/10"><Eye size={16} /></button>
                {showPricing && (
                  <>
                    <button onClick={() => handleDownload(q._id as string, q.reference as string)} className="p-2 rounded-lg hover:bg-primary/10 text-primary" title="Download PDF"><Download size={16} /></button>
                    <button onClick={() => window.print()} className="p-2 rounded-lg hover:bg-primary/10" title="Print"><Printer size={16} /></button>
                  </>
                )}
              </div>
            </div>

            {expanded === q._id && (
              <div className="px-6 pb-6 border-t border-steel/10 pt-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Requested Products</h4>
                  {items.map((item, i) => (
                    <div key={i} className="py-2 border-b border-steel/5 last:border-0 text-sm flex justify-between">
                      <div>
                        <span className="font-medium">{item.productName as string}</span>
                        <span className="text-charcoal/60 ml-2">× {item.quantity as number} {item.unit as string}</span>
                        {item.description ? <div className="text-xs text-charcoal/50">{item.description as string}</div> : null}
                      </div>
                      {showPricing && item.unitPrice ? (
                        <span className="font-medium text-primary">LKR {((item.totalPrice as number) || 0).toLocaleString()}</span>
                      ) : null}
                    </div>
                  ))}
                </div>

                {showPricing && (
                  <div className="p-4 bg-primary/5 rounded-xl text-sm space-y-1">
                    {q.subtotal != null ? <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(Number(q.subtotal))}</span></div> : null}
                    {Number(q.discount) > 0 ? <div className="flex justify-between"><span>Discount</span><span>{formatMoney(Number(q.discount))}</span></div> : null}
                    {q.netAmount != null ? <div className="flex justify-between font-medium"><span>Net Amount</span><span>{formatMoney(Number(q.netAmount))}</span></div> : null}
                    {(q.vatAmount != null || q.vat != null) ? (
                      <div className="flex justify-between"><span>VAT ({Number(q.vatPercentage) || 18}%)</span><span>{formatMoney(Number(q.vatAmount ?? q.vat))}</span></div>
                    ) : null}
                    <div className="flex justify-between font-bold text-lg text-primary pt-1 border-t border-primary/20">
                      <span>Grand Total</span><span>{formatMoney(Number(q.totalAmount) || 0)}</span>
                    </div>
                    {q.paymentTerms ? <div className="text-xs text-charcoal/60 pt-2">Payment: {q.paymentTerms as string}</div> : null}
                    {q.deliveryTime ? <div className="text-xs text-charcoal/60">Delivery: {q.deliveryTime as string}</div> : null}
                    {q.warranty ? <div className="text-xs text-charcoal/60">Warranty: {q.warranty as string}</div> : null}
                    {q.customerNotes ? <div className="text-xs text-charcoal/60 mt-2">{q.customerNotes as string}</div> : null}
                  </div>
                )}

                {!showPricing && (
                  <p className="text-sm text-charcoal/50 italic">Pricing will appear once our team sends your official quotation.</p>
                )}

                {canRespond && (
                  <div className="p-4 border border-steel/15 rounded-xl space-y-3">
                    <h4 className="font-semibold text-sm">Your Response</h4>
                    <textarea value={responseMsg} onChange={e => setResponseMsg(e.target.value)} placeholder="Optional message or revision notes..." className="input-field text-sm resize-none" rows={2} />
                    <div className="flex flex-wrap gap-2">
                      <button disabled={responding === q._id} onClick={() => handleRespond(q._id as string, 'accept')} className="btn-primary text-sm py-2 flex items-center gap-1"><CheckCircle size={14} /> Accept</button>
                      <button disabled={responding === q._id} onClick={() => handleRespond(q._id as string, 'revision')} className="btn-outline text-sm py-2 flex items-center gap-1"><MessageSquare size={14} /> Request Revision</button>
                      <button disabled={responding === q._id} onClick={() => handleRespond(q._id as string, 'reject')} className="text-sm py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"><XCircle size={14} /> Reject</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
