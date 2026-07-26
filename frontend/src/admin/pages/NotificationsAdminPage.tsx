import { useEffect, useState } from 'react';
import { adminNotifications, adminMarkNotificationRead, adminMarkAllNotificationsRead } from '../api';
import { PageHeader } from '../components/shared';

export default function NotificationsAdminPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => { adminNotifications().then(setItems); }, []);

  return (
    <div>
      <PageHeader title="Notifications" subtitle="System alerts and activity notifications"
        action={<button onClick={async () => { await adminMarkAllNotificationsRead(); adminNotifications().then(setItems); }} className="btn-outline text-sm py-2">Mark All Read</button>} />
      <div className="space-y-2">
        {items.map(n => (
          <div key={n._id as string} className={`bg-white dark:bg-charcoal rounded-xl p-4 border border-steel/10 flex justify-between items-center ${!n.read ? 'border-l-4 border-l-primary' : ''}`}>
            <div>
              <div className="font-medium text-sm">{n.title as string}</div>
              <div className="text-sm text-charcoal/60">{n.message as string}</div>
              <div className="text-xs text-charcoal/40 mt-1">{n.createdAt ? new Date(n.createdAt as string).toLocaleString() : ''}</div>
            </div>
            {!n.read && <button onClick={async () => { await adminMarkNotificationRead(n._id as string); adminNotifications().then(setItems); }} className="text-xs text-primary font-medium">Mark Read</button>}
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 text-charcoal/50">No notifications</p>}
      </div>
    </div>
  );
}
