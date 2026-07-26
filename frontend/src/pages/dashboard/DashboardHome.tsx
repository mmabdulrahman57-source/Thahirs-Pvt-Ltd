import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getMyQuotationStats, getMyQuotations } from '../../lib/api';
import { Skeleton } from '../../components/ui/Skeleton';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  quoted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function DashboardHome() {
  const [stats, setStats] = useState<{ total: number; pending: number; reviewing: number; approved: number; rejected: number } | null>(null);
  const [quotes, setQuotes] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyQuotationStats(), getMyQuotations()])
      .then(([s, q]) => { setStats(s); setQuotes(q.slice(0, 5)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;

  const cards = [
    { label: 'Total Quotations', value: stats?.total || 0, icon: FileText, color: 'text-primary' },
    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'text-yellow-600' },
    { label: 'Under Review', value: stats?.reviewing || 0, icon: Eye, color: 'text-blue-600' },
    { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-charcoal rounded-2xl p-5 border border-steel/10 shadow-sm">
            <c.icon className={`${c.color} mb-3`} size={22} />
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-charcoal/60 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-charcoal rounded-2xl border border-steel/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-steel/10 flex justify-between items-center">
          <h2 className="font-bold">Recent Quotations</h2>
          <Link to="/dashboard/quotations" className="text-sm text-primary font-semibold hover:underline">View All</Link>
        </div>
        {quotes.length === 0 ? (
          <div className="p-12 text-center text-charcoal/50">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No quotations yet.</p>
            <Link to="/quotation" className="btn-primary mt-4 inline-flex text-sm">Request Quotation</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-steel/5 text-left">
                <th className="px-6 py-3 font-semibold">Reference</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Items</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr></thead>
              <tbody>
                {quotes.map(q => (
                  <tr key={q._id as string} className="border-t border-steel/10 hover:bg-primary/5">
                    <td className="px-6 py-4 font-medium text-primary">{q.reference as string}</td>
                    <td className="px-6 py-4 text-charcoal/60">{new Date(q.createdAt as string).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{(q.items as unknown[])?.length || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[q.status as string] || 'bg-steel/20'}`}>
                        {q.status as string}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
