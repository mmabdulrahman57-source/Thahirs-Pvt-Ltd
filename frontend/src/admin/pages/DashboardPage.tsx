import { useEffect, useState } from 'react';
import {
  Users, UserPlus, Package, FolderTree, Award, FileText, Clock, CheckCircle,
  XCircle, MessageSquare, Mail, Users2, Image, Briefcase, Eye, TrendingUp,
} from 'lucide-react';
import { adminDashboard } from '../api';
import { StatCard, PageHeader, BarChart } from '../components/shared';
import { StatusBadge } from '../components/shared';

export default function DashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    adminDashboard().then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const stats = data.stats as Record<string, number>;
  const charts = data.charts as Record<string, Array<Record<string, unknown>>>;
  const activities = data.recentActivities as Array<Record<string, unknown>>;
  const recentQuotes = data.recentQuotations as Array<Record<string, unknown>>;

  const statCards = [
    { label: 'Total Visitors', value: stats.totalVisitors, icon: Eye, color: 'text-blue-500' },
    { label: "Today's Visitors", value: stats.todayVisitors, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-primary' },
    { label: 'New Customers', value: stats.newCustomers, icon: UserPlus, color: 'text-purple-500' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-orange-500' },
    { label: 'Categories', value: stats.totalCategories, icon: FolderTree, color: 'text-teal-500' },
    { label: 'Brands', value: stats.totalBrands, icon: Award, color: 'text-indigo-500' },
    { label: 'Total Quotations', value: stats.totalQuotations, icon: FileText, color: 'text-primary' },
    { label: 'Pending', value: stats.pendingQuotations, icon: Clock, color: 'text-yellow-600' },
    { label: 'Under Review', value: stats.reviewingQuotations, icon: FileText, color: 'text-blue-600' },
    { label: 'Approved', value: stats.approvedQuotations, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Rejected', value: stats.rejectedQuotations, icon: XCircle, color: 'text-red-500' },
    { label: 'Completed', value: stats.completedQuotations, icon: CheckCircle, color: 'text-purple-600' },
    { label: 'Messages', value: stats.contactMessages, icon: MessageSquare, color: 'text-pink-500' },
    { label: 'Newsletter', value: stats.newsletterSubscribers, icon: Mail, color: 'text-cyan-500' },
    { label: 'Team Members', value: stats.totalTeamMembers, icon: Users2, color: 'text-amber-600' },
    { label: 'Projects', value: stats.totalProjects, icon: Briefcase, color: 'text-lime-600' },
    { label: 'Gallery Images', value: stats.totalGalleryImages, icon: Image, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Overview" subtitle="Real-time business statistics and activity" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
          <h3 className="font-semibold mb-4">Monthly Quotation Requests</h3>
          <BarChart data={charts.monthlyQuotations} labelKey="month" valueKey="count" />
        </div>
        <div className="bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
          <h3 className="font-semibold mb-4">Customer Growth</h3>
          <BarChart data={charts.customerGrowth} labelKey="month" valueKey="count" color="#3B82F6" />
        </div>
        <div className="bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
          <h3 className="font-semibold mb-4">Website Traffic</h3>
          <BarChart data={charts.websiteTraffic} labelKey="month" valueKey="visitors" color="#10B981" />
        </div>
        <div className="bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
          <h3 className="font-semibold mb-4">Visitor Locations</h3>
          <div className="space-y-2">
            {(charts.visitorLocations as Array<{ country: string; count: number }>).map(l => (
              <div key={l.country} className="flex justify-between items-center text-sm">
                <span>{l.country}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-steel/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(l.count / 8500) * 100}%` }} />
                  </div>
                  <span className="text-charcoal/60 w-12 text-right">{l.count.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-steel/10 font-semibold">Recent Activities</div>
          <div className="divide-y divide-steel/10 max-h-64 overflow-auto">
            {activities.map((a, i) => (
              <div key={i} className="px-5 py-3 text-sm">
                <div>{a.message as string}</div>
                <div className="text-xs text-charcoal/40 mt-1">{a.createdAt ? new Date(a.createdAt as string).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-steel/10 font-semibold">Recent Quotations</div>
          <div className="divide-y divide-steel/10">
            {recentQuotes.map(q => {
              const c = q.customer as Record<string, string>;
              return (
                <div key={q._id as string} className="px-5 py-3 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium text-primary">{q.reference as string}</div>
                    <div className="text-charcoal/60">{c?.name}</div>
                  </div>
                  <StatusBadge status={q.status as string} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
