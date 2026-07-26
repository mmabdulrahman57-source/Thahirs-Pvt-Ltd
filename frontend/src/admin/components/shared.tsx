import type { LucideIcon } from 'lucide-react';

export function StatCard({ label, value, icon: Icon, color = 'text-primary' }: { label: string; value: number | string; icon: LucideIcon; color?: string }) {
  return (
    <div className="card-premium p-4 card-hover">
      <div className="flex items-center justify-between mb-2">
        <Icon className={color} size={20} />
      </div>
      <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-xs text-charcoal/50 mt-1">{label}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-charcoal/60 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean; footer?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div
        className={`card-premium w-full flex flex-col max-h-[90vh] ${wide ? 'max-w-4xl' : 'max-w-lg'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6 pb-3 border-b border-steel/10">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-steel/15 bg-white dark:bg-charcoal shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function BarChart({ data, labelKey, valueKey, color = '#F97316' }: { data: Array<Record<string, unknown>>; labelKey: string; valueKey: string; color?: string }) {
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md transition-all" style={{ height: `${(Number(d[valueKey]) / max) * 100}%`, backgroundColor: color, minHeight: 4 }} />
          <span className="text-[10px] text-charcoal/50 truncate w-full text-center">{String(d[labelKey])}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-steel/30 text-charcoal/60',
    new_request: 'bg-blue-100 text-blue-800', pending: 'bg-blue-100 text-blue-800', new: 'bg-blue-100 text-blue-800',
    under_review: 'bg-indigo-100 text-indigo-800', reviewing: 'bg-indigo-100 text-indigo-800',
    awaiting_pricing: 'bg-yellow-100 text-yellow-800',
    price_added: 'bg-cyan-100 text-cyan-800',
    manager_approval: 'bg-purple-100 text-purple-800',
    ready_to_send: 'bg-teal-100 text-teal-800',
    sent_to_customer: 'bg-green-100 text-green-800', approved: 'bg-green-100 text-green-800', quoted: 'bg-green-100 text-green-800', waiting_customer: 'bg-green-100 text-green-800',
    customer_viewed: 'bg-emerald-100 text-emerald-800',
    customer_accepted: 'bg-green-100 text-green-900',
    customer_rejected: 'bg-red-100 text-red-800', rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
    converted_to_order: 'bg-violet-100 text-violet-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-steel/30 text-charcoal/60',
    active: 'bg-green-100 text-green-800', archived: 'bg-steel/30 text-charcoal/60',
  };
  const labels: Record<string, string> = {
    new_request: 'New Request', under_review: 'Under Review', awaiting_pricing: 'Awaiting Pricing',
    price_added: 'Price Added', sent_to_customer: 'Sent to Customer', customer_accepted: 'Accepted',
    customer_rejected: 'Rejected', customer_viewed: 'Viewed', converted_to_order: 'Order',
  };
  const label = labels[status] || status?.replace(/_/g, ' ') || 'pending';
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-steel/20'}`}>{label}</span>;
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 text-charcoal/50">
      <p className="mb-4">{message}</p>
      {action}
    </div>
  );
}
