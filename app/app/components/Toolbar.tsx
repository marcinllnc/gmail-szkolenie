'use client';

import { Archive, Trash2, Mail, MailOpen, Tag, MoreVertical, ChevronDown } from 'lucide-react';

export type SortOrder = 'newest' | 'oldest';

interface Props {
  totalCount: number;
  selectedCount: number;
  labels: string[];
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (v: boolean) => void;
  onArchive: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onAddLabel: (label: string) => void;
}

export default function Toolbar({
  totalCount, selectedCount, labels,
  allSelected, someSelected,
  onSelectAll, onArchive, onDelete, onMarkRead, onMarkUnread, onAddLabel,
}: Props) {
  const iconBtn = "w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors flex-shrink-0";

  return (
    <div className="flex items-center px-4 py-1 flex-shrink-0" style={{ borderBottom: '1px solid var(--gmail-border)', minHeight: '52px' }}>
      {/* Checkbox + dropdown arrow */}
      <div className="flex items-center gap-0.5 mr-3">
        <input
          type="checkbox"
          checked={allSelected}
          ref={el => { if (el) el.indeterminate = someSelected; }}
          onChange={e => onSelectAll(e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
        <button className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded" style={{ color: 'var(--gmail-text-secondary)' }}>
          <ChevronDown size={14} />
        </button>
      </div>

      {selectedCount > 0 ? (
        <div className="flex items-center gap-0.5">
          <button onClick={onArchive} className={iconBtn} title="Archiwizuj" style={{ color: 'var(--gmail-text-secondary)' }}>
            <Archive size={18} />
          </button>
          <button onClick={onDelete} className={iconBtn} title="Usuń" style={{ color: 'var(--gmail-text-secondary)' }}>
            <Trash2 size={18} />
          </button>
          <button onClick={onMarkRead} className={iconBtn} title="Oznacz jako przeczytane" style={{ color: 'var(--gmail-text-secondary)' }}>
            <MailOpen size={18} />
          </button>
          <button onClick={onMarkUnread} className={iconBtn} title="Oznacz jako nieprzeczytane" style={{ color: 'var(--gmail-text-secondary)' }}>
            <Mail size={18} />
          </button>
          <div className="relative group">
            <button className={iconBtn} title="Etykiety" style={{ color: 'var(--gmail-text-secondary)' }}>
              <Tag size={18} />
            </button>
            <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl z-50 w-44 py-1"
              style={{ border: '1px solid var(--gmail-border)' }}>
              {labels.map(l => (
                <button key={l} onClick={() => onAddLabel(l)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" style={{ color: 'var(--gmail-text)' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button className={iconBtn} title="Więcej" style={{ color: 'var(--gmail-text-secondary)' }}>
            <MoreVertical size={18} />
          </button>
          <span className="ml-2 text-sm" style={{ color: 'var(--gmail-text-secondary)' }}>
            Zaznaczono: {selectedCount}
          </span>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right: count + pagination */}
      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
        <span className="text-sm" style={{ color: 'var(--gmail-text-secondary)' }}>
          1–{Math.min(50, totalCount)} z {totalCount}
        </span>
        <button className={iconBtn} title="Poprzednia strona" style={{ color: 'var(--gmail-text-secondary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button className={iconBtn} title="Następna strona" style={{ color: 'var(--gmail-text-secondary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}
