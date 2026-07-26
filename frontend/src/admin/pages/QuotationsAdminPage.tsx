import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download, Copy, Eye, Trash2, Archive, Filter,
  Printer, FileSpreadsheet, CheckSquare, Square,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminQuotations, adminQuotationDashboard, adminGetQuotation,
  adminUpdateQuotation, adminQuotationPdf, adminDuplicateQuotation,
  adminArchiveQuotation, adminDeleteQuotation, adminBulkQuotations, adminAdmins,
} from '../api';
import { PageHeader, Modal, StatCard, StatusBadge } from '../components/shared';
import QuotationEditor from '../components/quotation/QuotationEditor';
import AdminSearchBar from '../components/SearchBar';
import type { Quotation } from '../../types/quotation';
import { statusLabel, normalizeStatus } from '../../types/quotation';
import { FileText, Send, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

export default function QuotationsAdminPage() {
  const { filter } = useParams();
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [admins, setAdmins] = useState<Array<{ _id: string; name: string }>>([]);
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(filter === 'pending' ? 'new_request' : filter === 'approved' ? 'sent_to_customer' : '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [q, s, a] = await Promise.all([
        adminQuotations({
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(search ? { search } : {}),
          ...(priorityFilter ? { priority: priorityFilter } : {}),
        }),
        adminQuotationDashboard(),
        adminAdmins(),
      ]);
      setQuotes(q);
      setStats(s);
      setAdmins(a.map((x: { _id: string; name: string }) => ({ _id: x._id, name: x.name })));
    } catch { toast.error('Failed to load quotations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter, priorityFilter]);

  const handleSearch = () => load();

  const openEditor = async (id: string) => {
    try {
      const q = await adminGetQuotation(id);
      setSelected(q);
    } catch { toast.error('Failed to load quotation'); }
  };

  const handleSave = async (data: Record<string, unknown>, opts?: { sendEmail?: boolean; sendReminder?: boolean }) => {
    if (!selected) return;
    await adminUpdateQuotation(selected._id, { ...data, ...opts });
    toast.success(opts?.sendEmail ? 'Quotation sent to customer' : 'Saved');
    setSelected(null);
    load();
  };

  const handlePdf = async (id: string, ref: string) => {
    const blob = await adminQuotationPdf(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${ref}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCheck = (id: string) => {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const bulkAction = async (action: string, value?: string) => {
    if (!checked.size) return toast.error('Select quotations first');
    await adminBulkQuotations(Array.from(checked), action, value);
    toast.success(`${checked.size} quotation(s) updated`);
    setChecked(new Set());
    load();
  };

  const exportCsv = () => {
    const headers = 'Reference,Customer,Company,Email,Phone,Status,Priority,Items,Total,Date\n';
    const rows = quotes.map(q => `${q.reference},${q.customer.name},${q.customer.company || ''},${q.customer.email},${q.customer.phone || ''},${q.status},${q.priority || ''},${q.items.length},${q.totalAmount || 0},${q.createdAt}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'quotations.csv'; a.click();
  };

  const title = filter === 'pending' ? 'Pending Quotations' : filter === 'approved' ? 'Sent Quotations' : 'Quotation Management';

  const statCards = useMemo(() => [
    { label: 'Total Requests', value: stats.total || 0, icon: FileText },
    { label: 'New Requests', value: stats.newRequests || 0, icon: Clock },
    { label: 'Under Review', value: stats.pendingReview || 0, icon: Eye },
    { label: 'Price Added', value: stats.priceAdded || 0, icon: DollarSign },
    { label: 'Sent to Customer', value: stats.sentToCustomer || 0, icon: Send },
    { label: 'Accepted', value: stats.customerAccepted || 0, icon: CheckCircle },
    { label: 'Rejected', value: stats.customerRejected || 0, icon: XCircle },
    { label: 'This Month', value: stats.thisMonth || 0, icon: FileText },
  ], [stats]);

  return (
    <div>
      <PageHeader title={title} subtitle="Enterprise quotation workflow — review requests, add pricing, send to customers" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {statCards.map(s => <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />)}
      </div>

      {stats.totalValue !== undefined && (
        <div className="mb-4 p-3 bg-primary/5 rounded-xl flex flex-wrap gap-6 text-sm">
          <div><strong>Total Quotation Value:</strong> LKR {(stats.totalValue || 0).toLocaleString()}</div>
          <div><strong>This Month Value:</strong> LKR {(stats.thisMonthValue || 0).toLocaleString()}</div>
          <div><strong>Completed:</strong> {stats.completedOrders || 0}</div>
          <div><strong>Cancelled:</strong> {stats.cancelled || 0}</div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex flex-1 min-w-[240px] gap-2 items-stretch">
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by ref, name, company, email, phone..."
            className="flex-1"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-primary text-sm py-2 px-4 shrink-0">Search</button>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm w-auto">
          <option value="">All Statuses</option>
          {['new_request', 'under_review', 'awaiting_pricing', 'price_added', 'sent_to_customer', 'customer_accepted', 'customer_rejected', 'completed', 'cancelled'].map(s =>
            <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="input-field text-sm w-auto">
          <option value="">All Priorities</option>
          {['low', 'normal', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={exportCsv} className="btn-outline text-sm py-2"><FileSpreadsheet size={14} /> Export</button>
      </div>

      {checked.size > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm">
          <span>{checked.size} selected</span>
          <button onClick={() => bulkAction('status', 'sent_to_customer')} className="text-primary font-medium">Mark Sent</button>
          <button onClick={() => bulkAction('archive')} className="text-primary font-medium">Archive</button>
          <button onClick={() => bulkAction('delete')} className="text-red-500 font-medium">Delete</button>
        </div>
      )}

      <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-steel/5 text-left text-xs">
            <th className="px-3 py-3 w-8"></th>
            <th className="px-3 py-3">Quotation No.</th>
            <th className="px-3 py-3">Customer</th>
            <th className="px-3 py-3">Company</th>
            <th className="px-3 py-3">Contact</th>
            <th className="px-3 py-3">Date</th>
            <th className="px-3 py-3">Items</th>
            <th className="px-3 py-3">Sales Rep</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Priority</th>
            <th className="px-3 py-3">Total</th>
            <th className="px-3 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} className="text-center py-12 text-charcoal/50">Loading...</td></tr>
            ) : quotes.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-12 text-charcoal/50"><Filter size={32} className="mx-auto mb-2 opacity-30" />No quotations found</td></tr>
            ) : quotes.map(q => {
              const c = q.customer;
              const isChecked = checked.has(q._id);
              return (
                <tr key={q._id} className={`border-t border-steel/10 hover:bg-primary/5 ${isChecked ? 'bg-primary/5' : ''}`}>
                  <td className="px-3 py-3">
                    <button onClick={() => toggleCheck(q._id)}>{isChecked ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-charcoal/30" />}</button>
                  </td>
                  <td className="px-3 py-3 font-bold text-primary whitespace-nowrap">{q.reference}</td>
                  <td className="px-3 py-3 font-medium">{c.name}</td>
                  <td className="px-3 py-3 text-charcoal/60">{c.company || '—'}</td>
                  <td className="px-3 py-3 text-xs text-charcoal/60">{c.email}<br />{c.phone}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-3 text-center">{q.items.length}</td>
                  <td className="px-3 py-3 text-xs">{q.assignedTo || '—'}</td>
                  <td className="px-3 py-3"><StatusBadge status={normalizeStatus(q.status)} /></td>
                  <td className="px-3 py-3 capitalize text-xs">{q.priority || 'normal'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{q.totalAmount ? `LKR ${q.totalAmount.toLocaleString()}` : '—'}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-0.5">
                      <button onClick={() => openEditor(q._id)} title="View/Edit" className="p-1.5 rounded hover:bg-primary/10 text-primary"><Eye size={14} /></button>
                      <button onClick={() => handlePdf(q._id, q.reference)} title="PDF" className="p-1.5 rounded hover:bg-primary/10"><Download size={14} /></button>
                      <button onClick={() => window.print()} title="Print" className="p-1.5 rounded hover:bg-primary/10"><Printer size={14} /></button>
                      <button onClick={async () => { await adminDuplicateQuotation(q._id); toast.success('Duplicated'); load(); }} title="Duplicate" className="p-1.5 rounded hover:bg-primary/10"><Copy size={14} /></button>
                      <button onClick={async () => { await adminArchiveQuotation(q._id); load(); }} title="Archive" className="p-1.5 rounded hover:bg-steel/10"><Archive size={14} /></button>
                      <button onClick={async () => { if (confirm('Delete?')) { await adminDeleteQuotation(q._id); load(); } }} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Quotation Editor" wide>
        {selected && (
          <QuotationEditor quote={selected} admins={admins} onSave={handleSave} onClose={() => setSelected(null)} />
        )}
      </Modal>
    </div>
  );
}
