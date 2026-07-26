import { useEffect, useState } from 'react';
import { adminRoles, adminPermissions } from '../api';
import { PageHeader } from '../components/shared';

export default function RolesPage() {
  const [roles, setRoles] = useState<Array<{ _id: string; name: string; permissions: string[] }>>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    adminRoles().then(setRoles);
    adminPermissions().then(setPermissions);
  }, []);

  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Manage access control for admin users" />
      <div className="grid md:grid-cols-2 gap-4">
        {roles.map(role => (
          <div key={role._id} className="bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
            <h3 className="font-bold text-lg mb-1">{role.name}</h3>
            <p className="text-xs text-charcoal/50 mb-3">ID: {role._id}</p>
            <div className="flex flex-wrap gap-1.5">
              {role.permissions[0] === '*' ? (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">Full Access</span>
              ) : role.permissions.map(p => (
                <span key={p} className="px-2 py-1 bg-steel/10 text-charcoal/70 text-xs rounded-full capitalize">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10">
        <h3 className="font-semibold mb-3">Available Permissions</h3>
        <div className="flex flex-wrap gap-2">
          {permissions.map(p => (
            <span key={p} className="px-3 py-1.5 border border-steel/20 rounded-lg text-sm capitalize">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
