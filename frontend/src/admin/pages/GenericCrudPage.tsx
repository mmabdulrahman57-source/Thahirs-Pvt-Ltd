import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminList, adminCreate, adminUpdate, adminDelete } from '../api';
import { PageHeader, Modal, EmptyState } from '../components/shared';
import PhotoField from '../components/PhotoField';
import AdminSearchBar from '../components/SearchBar';

interface Field { key: string; label: string; type?: string; required?: boolean; options?: string[] }

interface Props {
  resource: string;
  title: string;
  fields: Field[];
  columns: { key: string; label: string; render?: (item: Record<string, unknown>) => React.ReactNode }[];
}

export default function GenericCrudPage({ resource, title, fields, columns }: Props) {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminList(resource).then(setItems).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [resource]);

  const openCreate = () => { setEditItem(null); setForm({}); setModal(true); };
  const openEdit = (item: Record<string, unknown>) => {
    setEditItem(item);
    const f: Record<string, string> = {};
    fields.forEach(field => { f[field.key] = String(item[field.key] ?? ''); });
    setForm(f);
    setModal(true);
  };

  const handleSave = async () => {
    try {
      const data: Record<string, unknown> = { ...form };
      fields.forEach(f => {
        if (f.type === 'number') data[f.key] = parseFloat(form[f.key]) || 0;
        if (f.type === 'checkbox') data[f.key] = form[f.key] === 'true';
      });
      if (editItem) await adminUpdate(resource, editItem._id as string, data);
      else await adminCreate(resource, data);
      toast.success(editItem ? 'Updated' : 'Created');
      setModal(false);
      load();
    } catch { toast.error('Save failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await adminDelete(resource, id);
    toast.success('Deleted');
    load();
  };

  const filtered = items.filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title={title} action={
        <button onClick={openCreate} className="btn-primary text-sm py-2"><Plus size={16} /> Add New</button>
      } />

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search..."
        className="mb-4 max-w-sm"
      />

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState message={`No ${title.toLowerCase()} yet`} action={<button onClick={openCreate} className="btn-primary text-sm">Add First</button>} />
      ) : (
        <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-steel/5 text-left">
                {columns.map(c => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
                <th className="px-4 py-3 w-24">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item._id as string} className="border-t border-steel/10 hover:bg-primary/5">
                    {columns.map(c => (
                      <td key={c.key} className="px-4 py-3">{c.render ? c.render(item) : String(item[c.key] ?? '')}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-primary/10 text-primary"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(item._id as string)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit' : 'Add New'}>
        <div className="space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              {f.type === 'image' ? (
                <PhotoField
                  label={f.label}
                  value={form[f.key] || ''}
                  onChange={url => setForm({ ...form, [f.key]: url })}
                />
              ) : (
                <>
                  <label className="text-sm font-medium mb-1 block">{f.label}{f.required && ' *'}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="input-field text-sm resize-none" rows={3} />
                  ) : f.type === 'select' ? (
                    <select value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="input-field text-sm">
                      <option value="">Select...</option>
                      {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type || 'text'} required={f.required} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="input-field text-sm" />
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="btn-primary flex-1 text-sm">Save</button>
            <button onClick={() => setModal(false)} className="btn-outline flex-1 text-sm">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
