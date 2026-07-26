import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminMessages, adminMarkMessageRead, adminDeleteMessage } from '../api';
import { PageHeader } from '../components/shared';

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => { adminMessages().then(setMessages); }, []);

  return (
    <div>
      <PageHeader title="Contact Messages" subtitle="View and manage customer inquiries" />
      <div className="space-y-3">
        {messages.map(m => (
          <div key={m._id as string} className={`bg-white dark:bg-charcoal rounded-xl p-5 border border-steel/10 ${!m.read ? 'border-l-4 border-l-primary' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{m.name as string} · {m.email as string}</div>
                <div className="text-sm text-primary">{m.subject as string}</div>
                {m.phone ? <div className="text-xs text-charcoal/50">{String(m.phone)}</div> : null}
                <p className="text-sm text-charcoal/70 mt-2">{m.message as string}</p>
                <div className="text-xs text-charcoal/40 mt-2">{new Date(m.createdAt as string).toLocaleString()}</div>
              </div>
              <div className="flex gap-1">
                {!m.read && <button onClick={async () => { await adminMarkMessageRead(m._id as string); adminMessages().then(setMessages); }} className="text-xs text-primary font-medium">Mark Read</button>}
                <button onClick={async () => { await adminDeleteMessage(m._id as string); toast.success('Deleted'); adminMessages().then(setMessages); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
