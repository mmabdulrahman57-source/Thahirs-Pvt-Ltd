import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Copy, Archive, RotateCcw, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminList, adminCreate, adminUpdate, adminDelete, adminDuplicateProduct, adminArchiveProduct, adminRestoreProduct } from '../api';
import { getApiError } from '../../lib/api';
import { PageHeader, Modal, StatusBadge } from '../components/shared';
import ImageManager, { type ProductImages } from '../components/ImageManager';

const emptyForm = {
  name: '', description: '', category: '', brand: '', featured: 'false', status: 'active', sku: '',
  image: '', images: [] as string[],
};

function productImages(p: Record<string, unknown>): ProductImages {
  const images = Array.isArray(p.images) ? (p.images as string[]).filter(Boolean) : [];
  const image = (p.image as string) || images[0] || '';
  return { image, images: images.length ? images : image ? [image] : [] };
}

function resolveSrc(url: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/')) return url;
  return `/${url}`;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [categories, setCategories] = useState<Array<Record<string, unknown>>>([]);
  const [brands, setBrands] = useState<Array<Record<string, unknown>>>([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    adminList('products').then(setProducts);
    adminList('categories').then(setCategories);
    adminList('brands').then(setBrands);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (p: Record<string, unknown>) => {
    const imgs = productImages(p);
    setEditItem(p);
    setForm({
      name: p.name as string,
      description: (p.description as string) || '',
      category: (p.category as string) || (p.category as { _id?: string })?._id || '',
      brand: (p.brand as string) || (p.brand as { _id?: string })?._id || '',
      featured: p.featured ? 'true' : 'false',
      status: (p.status as string) || 'active',
      sku: (p.sku as string) || '',
      image: imgs.image,
      images: imgs.images,
    });
    setModal(true);
  };

  const handleSave = async () => {
    try {
      const data = {
        name: form.name,
        description: form.description,
        category: form.category,
        brand: form.brand,
        featured: form.featured === 'true',
        status: form.status,
        sku: form.sku,
        image: form.image,
        images: form.images,
      };
      if (editItem) await adminUpdate('products', editItem._id as string, data);
      else await adminCreate('products', data);
      toast.success('Saved'); setModal(false); load();
    } catch (err) { toast.error(getApiError(err, 'Failed to save product')); }
  };

  return (
    <div>
      <PageHeader title="Product Management" subtitle="Add, edit, and manage industrial products"
        action={<button onClick={openCreate} className="btn-primary text-sm py-2"><Plus size={16} /> Add Product</button>} />

      <div className="bg-white dark:bg-charcoal rounded-xl border border-steel/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-steel/5 text-left">
            <th className="px-4 py-3 w-16">Image</th>
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Featured</th><th className="px-4 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {products.map(p => {
              const imgs = productImages(p);
              return (
                <tr key={p._id as string} className="border-t border-steel/10 hover:bg-primary/5">
                  <td className="px-4 py-3">
                    {imgs.image ? (
                      <img src={resolveSrc(imgs.image)} alt="" className="w-10 h-10 rounded-lg object-cover border border-steel/20" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-steel/10 flex items-center justify-center text-charcoal/30"><ImageIcon size={16} /></div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name as string}</td>
                  <td className="px-4 py-3 text-charcoal/60">{p.sku as string || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.archived ? 'archived' : (p.status as string || 'active')} /></td>
                  <td className="px-4 py-3">{p.featured ? '⭐' : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-primary/10 text-primary"><Pencil size={14} /></button>
                      <button onClick={async () => { await adminDuplicateProduct(p._id as string); toast.success('Duplicated'); load(); }} className="p-1.5 rounded hover:bg-primary/10" title="Duplicate"><Copy size={14} /></button>
                      {p.archived ? (
                        <button onClick={async () => { await adminRestoreProduct(p._id as string); load(); }} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Restore"><RotateCcw size={14} /></button>
                      ) : (
                        <button onClick={async () => { await adminArchiveProduct(p._id as string); load(); }} className="p-1.5 rounded hover:bg-steel/10" title="Archive"><Archive size={14} /></button>
                      )}
                      <button onClick={async () => { if (confirm('Delete?')) { await adminDelete('products', p._id as string); load(); } }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Product' : 'Add Product'} wide>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><label className="text-sm font-medium mb-1 block">Product Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-sm" /></div>
          <div><label className="text-sm font-medium mb-1 block">SKU / Product Code</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="input-field text-sm" /></div>
          <div><label className="text-sm font-medium mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field text-sm">
              <option value="">Select...</option>{categories.map(c => <option key={c._id as string} value={c._id as string}>{c.name as string}</option>)}
            </select></div>
          <div><label className="text-sm font-medium mb-1 block">Brand</label>
            <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="input-field text-sm">
              <option value="">Select...</option>{brands.map(b => <option key={b._id as string} value={b._id as string}>{b.name as string}</option>)}
            </select></div>
          <div className="md:col-span-2"><label className="text-sm font-medium mb-1 block">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-sm resize-none" rows={3} /></div>

          <ImageManager
            value={{ image: form.image, images: form.images }}
            onChange={({ image, images }) => setForm({ ...form, image, images })}
          />

          <div><label className="text-sm font-medium mb-1 block">Featured</label>
            <select value={form.featured} onChange={e => setForm({ ...form, featured: e.target.value })} className="input-field text-sm"><option value="false">No</option><option value="true">Yes</option></select></div>
          <div><label className="text-sm font-medium mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field text-sm"><option value="active">Active</option><option value="draft">Draft</option></select></div>
        </div>
        <button onClick={handleSave} className="btn-primary w-full text-sm mt-4">Save Product</button>
      </Modal>
    </div>
  );
}
