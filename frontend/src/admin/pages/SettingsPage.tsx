import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminSettings, adminSaveSettings } from '../api';
import { PageHeader } from '../components/shared';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_TAX_SETTINGS } from '../../types/quotation';

const tabs = ['Website', 'Email', 'WhatsApp', 'SEO', 'Tax Settings'];

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, Record<string, string>>>({});
  const [tab, setTab] = useState('Website');
  const isSuperAdmin = user?.adminRole === 'super_admin';

  useEffect(() => {
    adminSettings().then(s => {
      setSettings({
        ...s,
        tax: {
          vatPercentage: String(s.tax?.vatPercentage ?? DEFAULT_TAX_SETTINGS.vatPercentage),
          enabled: String(s.tax?.enabled ?? DEFAULT_TAX_SETTINGS.enabled),
          autoApply: String(s.tax?.autoApply ?? DEFAULT_TAX_SETTINGS.autoApply),
        },
      });
    });
  }, []);

  const handleSave = async () => {
    await adminSaveSettings(settings);
    toast.success('Settings saved');
  };

  const update = (section: string, key: string, value: string) => {
    setSettings(s => ({ ...s, [section]: { ...s[section], [key]: value } }));
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure website, email, WhatsApp, SEO, and tax"
        action={<button onClick={handleSave} className="btn-primary text-sm py-2">Save Settings</button>} />

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-primary text-white' : 'bg-white dark:bg-charcoal border border-steel/10'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-charcoal rounded-xl p-6 border border-steel/10 space-y-4">
        {tab === 'Website' && (
          <>
            {['name', 'address', 'phone', 'email', 'whatsapp', 'hours'].map(f => (
              <div key={f}><label className="text-sm font-medium capitalize mb-1 block">{f}</label>
                <input value={settings.company?.[f] || ''} onChange={e => update('company', f, e.target.value)} className="input-field text-sm" /></div>
            ))}
          </>
        )}
        {tab === 'Email' && (
          <>
            {['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'fromEmail'].map(f => (
              <div key={f}><label className="text-sm font-medium mb-1 block">{f}</label>
                <input type={f.includes('Pass') ? 'password' : 'text'} value={settings.email?.[f] || ''} onChange={e => update('email', f, e.target.value)} className="input-field text-sm" /></div>
            ))}
          </>
        )}
        {tab === 'WhatsApp' && (
          <>
            <div><label className="text-sm font-medium mb-1 block">WhatsApp Number</label>
              <input value={settings.whatsapp?.number || ''} onChange={e => update('whatsapp', 'number', e.target.value)} className="input-field text-sm" /></div>
            <div><label className="text-sm font-medium mb-1 block">Enabled</label>
              <select value={settings.whatsapp?.enabled || 'true'} onChange={e => update('whatsapp', 'enabled', e.target.value)} className="input-field text-sm">
                <option value="true">Yes</option><option value="false">No</option></select></div>
          </>
        )}
        {tab === 'SEO' && (
          <>
            <div><label className="text-sm font-medium mb-1 block">Default Meta Title</label>
              <input value={settings.seo?.defaultTitle || ''} onChange={e => update('seo', 'defaultTitle', e.target.value)} className="input-field text-sm" /></div>
            <div><label className="text-sm font-medium mb-1 block">Default Meta Description</label>
              <textarea value={settings.seo?.defaultDescription || ''} onChange={e => update('seo', 'defaultDescription', e.target.value)} className="input-field text-sm resize-none" rows={3} /></div>
            <div><label className="text-sm font-medium mb-1 block">Keywords</label>
              <input value={settings.seo?.keywords || ''} onChange={e => update('seo', 'keywords', e.target.value)} className="input-field text-sm" placeholder="industrial, valves, pipes, Sri Lanka" /></div>
          </>
        )}
        {tab === 'Tax Settings' && (
          <>
            {!isSuperAdmin && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
                Only Super Admin can change VAT settings. VAT is automatically applied to all quotations at the configured rate.
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">VAT Percentage</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                readOnly={!isSuperAdmin}
                value={settings.tax?.vatPercentage || '18'}
                onChange={e => update('tax', 'vatPercentage', e.target.value)}
                className={`input-field text-sm ${!isSuperAdmin ? 'bg-steel/10 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                disabled={!isSuperAdmin}
                value={settings.tax?.enabled || 'true'}
                onChange={e => update('tax', 'enabled', e.target.value)}
                className={`input-field text-sm ${!isSuperAdmin ? 'bg-steel/10 cursor-not-allowed' : ''}`}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Auto Apply</label>
              <select
                disabled={!isSuperAdmin}
                value={settings.tax?.autoApply || 'true'}
                onChange={e => update('tax', 'autoApply', e.target.value)}
                className={`input-field text-sm ${!isSuperAdmin ? 'bg-steel/10 cursor-not-allowed' : ''}`}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
