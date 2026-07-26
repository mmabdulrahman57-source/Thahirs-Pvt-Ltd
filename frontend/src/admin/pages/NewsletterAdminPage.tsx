import { useEffect, useState } from 'react';
import { Trash2, Download } from 'lucide-react';
import { adminNewsletter, adminDeleteSubscriber } from '../api';
import { PageHeader } from '../components/shared';

export default function NewsletterAdminPage() {
  const [subs, setSubs] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => { adminNewsletter().then(setSubs); }, []);

  const exportCsv = () => {
    const csv = 'Email,Date\n' + subs.map(s => `${s.email},${s.createdAt}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'subscribers.csv'; a.click();
  };

  return (
    <div>
      <PageHeader title="Newsletter Subscribers" subtitle="Manage email subscribers"
        action={<button onClick={exportCsv} className="btn-outline text-sm py-2"><Download size={16} /> Export CSV</button>} />
      <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-steel/5 text-left"><th className="px-4 py-3">Email</th><th className="px-4 py-3">Subscribed</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {subs.map(s => (
              <tr key={s._id as string} className="border-t border-steel/10">
                <td className="px-4 py-3">{s.email as string}</td>
                <td className="px-4 py-3 text-charcoal/60">{s.createdAt ? new Date(s.createdAt as string).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3"><button onClick={async () => { await adminDeleteSubscriber(s._id as string); adminNewsletter().then(setSubs); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {subs.length === 0 && <p className="text-center py-8 text-charcoal/50">No subscribers yet</p>}
      </div>
    </div>
  );
}
