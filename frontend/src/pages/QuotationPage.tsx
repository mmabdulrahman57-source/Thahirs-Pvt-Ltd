import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Plus, Trash2, Send, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FadeIn } from '../components/ui/AnimatedCounter';
import PageHero from '../components/ui/PageHero';
import { useQuotation } from '../context/QuotationContext';
import { useAuth } from '../context/AuthContext';
import { submitQuotation } from '../lib/api';
import { PageLoader } from '../components/ui/Skeleton';

export default function QuotationPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, addItem, removeItem, updateItem, clear } = useQuotation();
  const [customer, setCustomer] = useState({
    name: '', company: '', email: '', phone: '', whatsapp: '',
  });
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ reference: string } | null>(null);

  useEffect(() => {
    if (user) {
      setCustomer({
        name: user.name || '',
        company: user.company || '',
        email: user.email || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
      });
    }
  }, [user]);

  if (authLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.productName.trim());
    if (validItems.length === 0) { toast.error('Please add at least one product.'); return; }
    setLoading(true);
    try {
      const result = await submitQuotation({ customer, items: validItems, requiredDeliveryDate, priority: 'normal' });
      setSubmitted({ reference: result.reference });
      clear();
      toast.success('Quotation request submitted!');
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="section-padding min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-white dark:bg-charcoal rounded-2xl p-10 shadow-xl border border-steel/10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
          <p className="text-charcoal/60 mb-2">Your reference number:</p>
          <p className="text-xl font-bold text-primary mb-6">{submitted.reference}</p>
          <p className="text-sm text-charcoal/60 mb-6">Our sales team will review your requirements and send you a quotation. No prices are shown until we send the official quote.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard/quotations" className="btn-primary text-sm">Track Status</Link>
            <button onClick={() => setSubmitted(null)} className="btn-outline text-sm">Submit Another</button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      <PageHero title="Request a Quotation" subtitle="Submit your product requirements — no prices shown until our team sends your official quote"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Quotation' }]} />

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <FadeIn>
              <div className="card-premium p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-5">Customer Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1.5 block">Full Name *</label><input required value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="input-field" /></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Company Name</label><input value={customer.company} onChange={e => setCustomer({ ...customer, company: e.target.value })} className="input-field" /></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Email *</label><input required type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="input-field" /></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Phone Number</label><input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="input-field" /></div>
                  <div><label className="text-sm font-medium mb-1.5 block">WhatsApp Number</label><input value={customer.whatsapp} onChange={e => setCustomer({ ...customer, whatsapp: e.target.value })} className="input-field" /></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Required Delivery Date</label><input type="date" value={requiredDeliveryDate} onChange={e => setRequiredDeliveryDate(e.target.value)} className="input-field" /></div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="card-premium p-6 sm:p-8">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold">Product Requirements ({items.length})</h2>
                  <button type="button" onClick={() => addItem({ productName: '', quantity: 1, unit: 'pcs' })} className="btn-primary text-sm py-2"><Plus size={16} /> Add Product</button>
                </div>
                {items.length === 0 ? (
                  <div className="text-center py-10 text-charcoal/50">
                    <p className="mb-4">No products added yet.</p>
                    <Link to="/products" className="text-primary font-semibold hover:underline">Browse Products →</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, i) => (
                      <div key={i} className="border border-steel/15 rounded-xl p-4 bg-light/50 dark:bg-charcoal/50">
                        <div className="flex justify-between mb-3">
                          <span className="font-semibold text-sm text-primary">Product {i + 1}</span>
                          <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <input required placeholder="Product Name *" value={item.productName} onChange={e => updateItem(i, { productName: e.target.value })} className="input-field text-sm" />
                          <input placeholder="Product Code (Optional)" value={item.productCode || ''} onChange={e => updateItem(i, { productCode: e.target.value })} className="input-field text-sm" />
                          <input placeholder="Category" value={item.category || ''} onChange={e => updateItem(i, { category: e.target.value })} className="input-field text-sm" />
                          <input placeholder="Brand Preference" value={item.preferredBrand || ''} onChange={e => updateItem(i, { preferredBrand: e.target.value })} className="input-field text-sm" />
                          <input placeholder="Description" value={item.description || ''} onChange={e => updateItem(i, { description: e.target.value })} className="input-field text-sm md:col-span-2" />
                          <input type="number" min={1} placeholder="Quantity" value={item.quantity} onChange={e => updateItem(i, { quantity: parseInt(e.target.value) || 1 })} className="input-field text-sm" />
                          <select value={item.unit} onChange={e => updateItem(i, { unit: e.target.value })} className="input-field text-sm">
                            {['pcs', 'sets', 'meters', 'kg', 'liters', 'boxes'].map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <input type="date" placeholder="Required Delivery" value={item.requiredDate || ''} onChange={e => updateItem(i, { requiredDate: e.target.value })} className="input-field text-sm" />
                          <input placeholder="Delivery Location" value={item.deliveryLocation || ''} onChange={e => updateItem(i, { deliveryLocation: e.target.value })} className="input-field text-sm" />
                          <input placeholder="Reference Image/File URL (Optional)" value={item.referenceFile || ''} onChange={e => updateItem(i, { referenceFile: e.target.value })} className="input-field text-sm md:col-span-2" />
                          <input placeholder="Additional Notes" value={item.specialNotes || ''} onChange={e => updateItem(i, { specialNotes: e.target.value })} className="input-field text-sm md:col-span-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4">
              {loading ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : <><Send size={20} /> Submit Quotation Request</>}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
