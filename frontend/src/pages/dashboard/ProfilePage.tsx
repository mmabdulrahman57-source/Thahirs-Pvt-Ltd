import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', company: user?.company || '', phone: user?.phone || '',
    whatsapp: user?.whatsapp || '', address: user?.address || '', password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      if (!data.password) delete (data as { password?: string }).password;
      await updateProfile(data);
      toast.success('Profile updated!');
      setForm(f => ({ ...f, password: '' }));
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-charcoal rounded-2xl border border-steel/10 p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold">Edit Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1.5 block">Full Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Email</label><input disabled value={user?.email || ''} className="input-field opacity-60" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">WhatsApp</label><input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="input-field" /></div>
          <div className="sm:col-span-2"><label className="text-sm font-medium mb-1.5 block">Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" /></div>
          <div className="sm:col-span-2"><label className="text-sm font-medium mb-1.5 block">New Password (leave blank to keep)</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Min. 6 characters" /></div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
