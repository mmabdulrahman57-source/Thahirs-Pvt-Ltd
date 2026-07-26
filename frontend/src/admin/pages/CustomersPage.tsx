import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCustomers, adminCreateCustomer, adminUpdateCustomer, adminDeleteCustomer, adminCustomerQuotations } from '../api';
import { PageHeader, Modal, StatusBadge } from '../components/shared';
import AdminSearchBar from '../components/SearchBar';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Array<Record<string, unknown>>>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '', active: 'true' });
  const [viewQuotes, setViewQuotes] = useState<Array<Record<string, unknown>> | null>(null);

  const load = () => adminCustomers(search).then(setCustomers).catch(() => {});
  useEffect(() => { load(); }, [search]);

  const handleSave = async () => {
    try {
      const data = { ...form, active: form.active === 'true' };
      if (editItem) await adminUpdateCustomer(editItem._id as string, data);
      else await adminCreateCustomer(data);
      toast.success('Saved'); setModal(false); load();
    } catch (e: unknown) { toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <PageHeader title="Customer Management" subtitle="View and manage registered customers"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', email: '', password: '', company: '', phone: '', active: 'true' }); setModal(true); }} className="btn-primary text-sm py-2"><Plus size={16} /> Add Customer</button>} />

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search customers..."
        className="mb-4 max-w-sm"
      />

      <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-steel/5 text-left">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id as string} className="border-t border-steel/10 hover:bg-primary/5">
                <td className="px-4 py-3 font-medium">{c.name as string}</td>
                <td className="px-4 py-3 text-charcoal/60">{c.email as string}</td>
                <td className="px-4 py-3">{c.company as string || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={c.active === false ? 'rejected' : 'active'} /></td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => adminCustomerQuotations(c._id as string).then(setViewQuotes)} className="p-1.5 rounded hover:bg-primary/10" title="Quotations"><Eye size={14} /></button>
                  <button onClick={() => { setEditItem(c); setForm({ name: c.name as string, email: c.email as string, password: '', company: (c.company as string) || '', phone: (c.phone as string) || '', active: c.active === false ? 'false' : 'true' }); setModal(true); }} className="p-1.5 rounded hover:bg-primary/10 text-primary"><Pencil size={14} /></button>
                  <button onClick={async () => { if (confirm('Delete?')) { await adminDeleteCustomer(c._id as string); load(); } }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Customer' : 'Add Customer'}>
        <div className="space-y-3">
          {['name', 'email', 'company', 'phone'].map(f => (
            <div key={f}><label className="text-sm font-medium capitalize mb-1 block">{f}</label>
              <input value={form[f as keyof typeof form]} onChange={e => setForm({ ...form, [f]: e.target.value })} className="input-field text-sm" /></div>
          ))}
          <div><label className="text-sm font-medium mb-1 block">{editItem ? 'New Password (optional)' : 'Password'}</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field text-sm" /></div>
          <select value={form.active} onChange={e => setForm({ ...form, active: e.target.value })} className="input-field text-sm">
            <option value="true">Active</option><option value="false">Deactivated</option>
          </select>
          <button onClick={handleSave} className="btn-primary w-full text-sm">Save</button>
        </div>
      </Modal>

      <Modal open={!!viewQuotes} onClose={() => setViewQuotes(null)} title="Quotation History">
        {viewQuotes?.length === 0 ? <p className="text-charcoal/50 text-sm">No quotations</p> : viewQuotes?.map(q => (
          <div key={q._id as string} className="py-2 border-b border-steel/10 flex justify-between text-sm">
            <span className="font-medium text-primary">{q.reference as string}</span>
            <StatusBadge status={q.status as string} />
          </div>
        ))}
      </Modal>
    </div>
  );
}
