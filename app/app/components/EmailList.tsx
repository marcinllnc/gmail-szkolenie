'use client';

import { Email, StarColor } from '../types';
import { Paperclip, Clock, VolumeX } from 'lucide-react';
import { formatFileSize } from '../lib/searchParser';

const STAR_NEXT: Record<StarColor, StarColor> = {
  none: 'yellow', yellow: 'red', red: 'blue', blue: 'green',
  green: 'purple', purple: 'none', orange: 'none',
};

function StarIcon({ color }: { color: StarColor }) {
  const styles: Record<StarColor, string> = {
    none: 'text-gray-300 hover:text-yellow-400',
    yellow: 'text-yellow-400',
    red: 'text-red-500',
    blue: 'text-blue-500',
    orange: 'text-orange-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
  };
  return (
    <span className={`text-lg leading-none cursor-pointer transition-colors select-none ${styles[color]}`}>
      {color === 'none' ? '☆' : '★'}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  if (date.toDateString() === today.toDateString())
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  if (date.getFullYear() === today.getFullYear())
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  emails: Email[];
  selectedIds: string[];
  openEmailId: string | null;
  focusedIndex: number;
  keyboardShortcutsEnabled: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onOpen: (id: string) => void;
  onStar: (id: string, color: StarColor) => void;
  onSnooze: (id: string) => void;
  onMute: (id: string) => void;
}

export default function EmailList({
  emails, selectedIds, openEmailId, focusedIndex,
  keyboardShortcutsEnabled, onSelect, onSelectAll, onOpen, onStar, onSnooze, onMute,
}: Props) {
  const allSelected = emails.length > 0 && selectedIds.length === emails.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--gmail-text-secondary)' }}>
        <div className="text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-sm">Brak wiadomości</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Select-all row */}
      <div className="flex items-center gap-3 px-4 py-2 sticky top-0 bg-white z-10" style={{ borderBottom: '1px solid var(--gmail-border)' }}>
        <input
          type="checkbox"
          checked={allSelected}
          ref={el => { if (el) el.indeterminate = someSelected; }}
          onChange={e => onSelectAll(e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
        {selectedIds.length > 0 && (
          <span className="text-sm" style={{ color: 'var(--gmail-text-secondary)' }}>Zaznaczono: {selectedIds.length}</span>
        )}
      </div>

      {emails.map((email, idx) => {
        const isSelected = selectedIds.includes(email.id);
        const isOpen = email.id === openEmailId;
        const isFocused = keyboardShortcutsEnabled && idx === focusedIndex;

        let rowBg = email.isRead ? 'var(--gmail-read-bg)' : 'var(--gmail-unread-bg)';
        if (isSelected) rowBg = 'var(--gmail-selected)';
        else if (isOpen) rowBg = '#fef3c7';
        else if (isFocused) rowBg = 'var(--gmail-hover)';

        return (
          <div
            key={email.id}
            className="group flex items-center gap-3 px-4 cursor-pointer transition-colors"
            style={{
              background: rowBg,
              borderBottom: '1px solid var(--gmail-border)',
              height: '52px',
            }}
            onMouseEnter={e => { if (!isSelected && !isOpen) (e.currentTarget as HTMLElement).style.background = 'var(--gmail-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg; }}
            onClick={() => onOpen(email.id)}
          >
            {/* Checkbox */}
            <div onClick={e => e.stopPropagation()} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={isSelected ? { opacity: 1 } : {}}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={e => onSelect(email.id, e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-blue-600"
              />
            </div>

            {/* Star */}
            <div
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={email.starColor !== 'none' ? { opacity: 1 } : {}}
              onClick={e => { e.stopPropagation(); onStar(email.id, STAR_NEXT[email.starColor]); }}
            >
              <StarIcon color={email.starColor} />
            </div>

            {/* Sender */}
            <div className="w-40 flex-shrink-0 truncate text-sm" style={{ fontWeight: email.isRead ? 400 : 700, color: 'var(--gmail-text)' }}>
              {email.senderName}
            </div>

            {/* Subject + snippet */}
            <div className="flex-1 min-w-0 flex items-baseline gap-1.5 overflow-hidden">
              <span className="text-sm truncate flex-shrink-0 max-w-[280px]" style={{ fontWeight: email.isRead ? 400 : 700, color: 'var(--gmail-text)' }}>
                {email.subject}
              </span>
              <span className="text-sm truncate" style={{ color: 'var(--gmail-text-secondary)', fontWeight: 400 }}>
                — {email.body.slice(0, 80)}
              </span>
            </div>

            {/* Hover actions */}
            <div
              className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => onSnooze(email.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200" title="Odłóż" style={{ color: 'var(--gmail-text-secondary)' }}>
                <Clock size={16} />
              </button>
              <button onClick={() => onMute(email.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200" title="Wycisz wątek" style={{ color: 'var(--gmail-text-secondary)' }}>
                <VolumeX size={16} />
              </button>
            </div>

            {/* Attachment + date */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {email.hasAttachment && (
                <span title={email.attachmentSize ? `${email.attachmentName} (${formatFileSize(email.attachmentSize)})` : 'Załącznik'}>
                  <Paperclip size={14} style={{ color: 'var(--gmail-text-secondary)' }} />
                </span>
              )}
              {email.snoozeUntil && (
                <span title="Odłożone">
                  <Clock size={14} className="text-orange-400" />
                </span>
              )}
              <span className="text-xs tabular-nums" style={{ fontWeight: email.isRead ? 400 : 700, color: email.isRead ? 'var(--gmail-text-secondary)' : 'var(--gmail-text)', minWidth: '52px', textAlign: 'right' }}>
                {formatDate(email.date)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
