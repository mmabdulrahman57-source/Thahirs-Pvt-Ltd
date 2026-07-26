import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAdmins, adminCreateAdmin, adminUpdateAdmin, adminDeleteAdmin, adminRoles } from '../api';
import { PageHeader, Modal } from '../components/shared';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Array<Record<string, unknown>>>([]);
  const [roles, setRoles] = useState<Array<{ _id: string; name: string }>>([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', adminRole: 'admin' });

  useEffect(() => { adminAdmins().then(setAdmins); adminRoles().then(setRoles); }, []);

  const handleSave = async () => {
    try {
      if (editItem) await adminUpdateAdmin(editItem._id as string, form);
      else await adminCreateAdmin(form);
      toast.success('Saved'); setModal(false);
      adminAdmins().then(setAdmins);
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <PageHeader title="Admin Management" subtitle="Manage administrator accounts and roles"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', email: '', password: '', adminRole: 'admin' }); setModal(true); }} className="btn-primary text-sm py-2"><Plus size={16} /> Add Admin</button>} />

      <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-steel/5 text-left">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {admins.map(a => (
              <tr key={a._id as string} className="border-t border-steel/10">
                <td className="px-4 py-3 font-medium">{a.name as string}</td>
                <td className="px-4 py-3">{a.email as string}</td>
                <td className="px-4 py-3 capitalize">{a.adminRole as string || 'admin'}</td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => { setEditItem(a); setForm({ name: a.name as string, email: a.email as string, password: '', adminRole: (a.adminRole as string) || 'admin' }); setModal(true); }} className="p-1.5 rounded hover:bg-primary/10 text-primary"><Pencil size={14} /></button>
                  <button onClick={async () => { if (confirm('Delete admin?')) { await adminDeleteAdmin(a._id as string); adminAdmins().then(setAdmins); } }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Admin' : 'Add Admin'}>
        <div className="space-y-3">
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-sm" />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field text-sm" />
          <input type="password" placeholder={editItem ? 'New password (optional)' : 'Password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field text-sm" />
          <select value={form.adminRole} onChange={e => setForm({ ...form, adminRole: e.target.value })} className="input-field text-sm">
            {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
          <button onClick={handleSave} className="btn-primary w-full text-sm">Save</button>
        </div>
      </Modal>
    </div>
  );
}
