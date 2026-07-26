import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminReport } from '../api';
import { PageHeader } from '../components/shared';

const reportTypes = [
  { id: 'customers', label: 'Customers Report' },
  { id: 'quotations', label: 'Quotations Report' },
  { id: 'products', label: 'Products Report' },
  { id: 'messages', label: 'Contact Messages Report' },
  { id: 'users', label: 'User Registrations Report' },
];

export default function ReportsPage() {
  const [active, setActive] = useState('quotations');
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => { adminReport(active).then(setData).catch(() => setData([])); }, [active]);

  const exportCsv = () => {
    if (!data.length) return toast.error('No data');
    const keys = Object.keys(data[0]).filter(k => k !== 'password');
    const csv = keys.join(',') + '\n' + data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${active}-report.csv`; a.click();
    toast.success('Report exported');
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export business reports"
        action={<button onClick={exportCsv} className="btn-primary text-sm py-2"><Download size={16} /> Export CSV</button>} />

      <div className="flex flex-wrap gap-2 mb-6">
        {reportTypes.map(r => (
          <button key={r.id} onClick={() => setActive(r.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active === r.id ? 'bg-primary text-white' : 'bg-white dark:bg-charcoal border border-steel/10 hover:bg-primary/5'}`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 p-4">
        <p className="text-sm text-charcoal/60 mb-4">{data.length} records found</p>
        <div className="overflow-x-auto max-h-96">
          <pre className="text-xs">{JSON.stringify(data.slice(0, 20), null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
