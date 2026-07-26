import { useEffect, useState } from 'react';
import { Database, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminBackup, adminBackups } from '../api';
import { PageHeader } from '../components/shared';

export default function BackupPage() {
  const [backups, setBackups] = useState<string[]>([]);

  useEffect(() => { adminBackups().then(setBackups); }, []);

  const handleBackup = async () => {
    await adminBackup();
    toast.success('Backup created successfully');
    adminBackups().then(setBackups);
  };

  return (
    <div>
      <PageHeader title="Backup & Restore" subtitle="Manage database backups" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-charcoal rounded-xl p-6 border border-steel/10">
          <Database className="text-primary mb-3" size={32} />
          <h3 className="font-bold mb-2">Manual Backup</h3>
          <p className="text-sm text-charcoal/60 mb-4">Create a snapshot of the entire database including products, quotations, users, and settings.</p>
          <button onClick={handleBackup} className="btn-primary text-sm"><Download size={16} /> Create Backup Now</button>
        </div>
        <div className="bg-white dark:bg-charcoal rounded-xl p-6 border border-steel/10">
          <h3 className="font-bold mb-4">Backup History</h3>
          {backups.length === 0 ? <p className="text-sm text-charcoal/50">No backups yet</p> : (
            <div className="space-y-2">
              {backups.map(b => (
                <div key={b} className="flex items-center gap-2 text-sm p-2 bg-steel/5 rounded-lg">
                  <Database size={14} className="text-primary" /> {b}
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-charcoal/40 mt-4">Automatic daily backups — coming soon</p>
        </div>
      </div>
    </div>
  );
}
