import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminCms, adminSaveCms } from '../api';
import { PageHeader } from '../components/shared';

const sections = [
  { key: 'homepage_hero', label: 'Homepage Hero', fields: ['title', 'subtitle', 'description'] },
  { key: 'about_intro', label: 'About Introduction', fields: ['title', 'content'] },
  { key: 'services_intro', label: 'Services Introduction', fields: ['title', 'content'] },
  { key: 'contact_intro', label: 'Contact Introduction', fields: ['title', 'content'] },
  { key: 'footer_text', label: 'Footer Text', fields: ['content'] },
];

export default function CmsPage() {
  const [cms, setCms] = useState<Record<string, Record<string, string>>>({});
  const [active, setActive] = useState(sections[0].key);

  useEffect(() => { adminCms().then(setCms); }, []);

  const handleSave = async () => {
    await adminSaveCms(cms);
    toast.success('Content saved');
  };

  const section = sections.find(s => s.key === active)!;
  const data = cms[active] || {};

  return (
    <div>
      <PageHeader title="Website CMS" subtitle="Edit website content without coding"
        action={<button onClick={handleSave} className="btn-primary text-sm py-2">Save All Changes</button>} />

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          {sections.map(s => (
            <button key={s.key} onClick={() => setActive(s.key)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${active === s.key ? 'bg-primary text-white' : 'bg-white dark:bg-charcoal border border-steel/10 hover:bg-primary/5'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="lg:col-span-3 bg-white dark:bg-charcoal rounded-xl p-6 border border-steel/10 space-y-4">
          <h3 className="font-semibold">{section.label}</h3>
          {section.fields.map(f => (
            <div key={f}>
              <label className="text-sm font-medium capitalize mb-1 block">{f}</label>
              {f === 'content' || f === 'description' ? (
                <textarea value={data[f] || ''} onChange={e => setCms({ ...cms, [active]: { ...data, [f]: e.target.value } })} className="input-field text-sm resize-none" rows={4} />
              ) : (
                <input value={data[f] || ''} onChange={e => setCms({ ...cms, [active]: { ...data, [f]: e.target.value } })} className="input-field text-sm" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
