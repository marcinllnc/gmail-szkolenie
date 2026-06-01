'use client';

import { Archive, Trash2, MailOpen, Mail, Tag } from 'lucide-react';

interface Props {
  selectedCount: number;
  labels: string[];
  onArchive: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onAddLabel: (label: string) => void;
}

export default function ActionBar({ selectedCount, labels, onArchive, onDelete, onMarkRead, onMarkUnread, onAddLabel }: Props) {
  if (selectedCount === 0) return null;

  const btn = "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors";

  return (
    <div className="flex items-center gap-1 px-4 py-2 flex-shrink-0" style={{ background: 'var(--gmail-blue-light)', borderBottom: '1px solid var(--gmail-border)' }}>
      <span className="text-sm font-medium mr-2" style={{ color: 'var(--gmail-sidebar-active-text)' }}>
        {selectedCount} zaznaczono
      </span>
      <button onClick={onArchive} className={btn} title="Archiwizuj" style={{ color: 'var(--gmail-text)' }}>
        <Archive size={16} /> Archiwizuj
      </button>
      <button onClick={onDelete} className={btn} title="Usuń" style={{ color: 'var(--gmail-text)' }}>
        <Trash2 size={16} /> Usuń
      </button>
      <button onClick={onMarkRead} className={btn} style={{ color: 'var(--gmail-text)' }}>
        <MailOpen size={16} /> Przeczytane
      </button>
      <button onClick={onMarkUnread} className={btn} style={{ color: 'var(--gmail-text)' }}>
        <Mail size={16} /> Nieprzeczytane
      </button>
      <div className="relative group">
        <button className={btn} style={{ color: 'var(--gmail-text)' }}>
          <Tag size={16} /> Etykiety ▾
        </button>
        <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl z-50 w-44 py-1"
          style={{ border: '1px solid var(--gmail-border)' }}>
          {labels.map(label => (
            <button key={label} onClick={() => onAddLabel(label)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" style={{ color: 'var(--gmail-text)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
