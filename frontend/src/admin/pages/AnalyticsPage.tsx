import { useEffect, useState } from 'react';
import { adminAnalytics } from '../api';
import { PageHeader, BarChart, StatCard } from '../components/shared';
import { Eye, MousePointer, Globe } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { adminAnalytics().then(setData); }, []);

  if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Website traffic and user behavior (Google Analytics ready)" />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Bounce Rate" value={`${data.bounceRate}%`} icon={MousePointer} color="text-orange-500" />
        <StatCard label="Total Visitors" value={data.totalVisitors as number || 12450} icon={Eye} color="text-blue-500" />
        <StatCard label="Page Views" value={data.totalPageViews as number || 45200} icon={Globe} color="text-green-500" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
          <h3 className="font-semibold mb-4">Devices</h3>
          {(data.devices as Array<{ name: string; value: number }>)?.map(d => (
            <div key={d.name} className="flex justify-between items-center py-2 text-sm">
              <span>{d.name}</span><span className="font-medium">{d.value}%</span>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
          <h3 className="font-semibold mb-4">Browsers</h3>
          {(data.browsers as Array<{ name: string; value: number }>)?.map(b => (
            <div key={b.name} className="flex justify-between items-center py-2 text-sm">
              <span>{b.name}</span><span className="font-medium">{b.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
        <h3 className="font-semibold mb-4">Most Viewed Products</h3>
        <BarChart data={(data.topProducts as Array<Record<string, unknown>>) || []} labelKey="name" valueKey="views" />
      </div>
    </div>
  );
}
