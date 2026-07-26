import { useEffect, useState } from 'react';
import { adminLogs, adminLoginLogs } from '../api';
import { PageHeader } from '../components/shared';

export default function LogsPage() {
  const [tab, setTab] = useState<'activity' | 'login'>('activity');
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    (tab === 'activity' ? adminLogs() : adminLoginLogs()).then(setLogs);
  }, [tab]);

  return (
    <div>
      <PageHeader title="System Logs" subtitle="Audit trail and login history" />
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('activity')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'activity' ? 'bg-primary text-white' : 'bg-white border border-steel/10'}`}>Activity Logs</button>
        <button onClick={() => setTab('login')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'login' ? 'bg-primary text-white' : 'bg-white border border-steel/10'}`}>Login History</button>
      </div>
      <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-hidden">
        <div className="divide-y divide-steel/10 max-h-[500px] overflow-auto">
          {logs.map((l, i) => (
            <div key={i} className="px-5 py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium capitalize">{l.type as string}</span>
                <span className="text-xs text-charcoal/40">{l.createdAt ? new Date(l.createdAt as string).toLocaleString() : ''}</span>
              </div>
              <div className="text-charcoal/60 mt-0.5">{l.message as string}</div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center py-8 text-charcoal/50">No logs yet</p>}
        </div>
      </div>
    </div>
  );
}
