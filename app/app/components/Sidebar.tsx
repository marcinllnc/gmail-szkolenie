'use client';

import { useState } from 'react';
import { AppState, Email } from '../types';
import { Inbox, Star, Clock, Send, FileText, Trash2, Tag, Plus, ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  state: AppState;
  collapsed: boolean;
  onFolderChange: (folder: string) => void;
  onCreateLabel: (name: string) => void;
}

function countUnread(emails: Email[], predicate: (e: Email) => boolean) {
  return emails.filter(e => predicate(e) && !e.isRead).length;
}

export default function Sidebar({ state, collapsed, onFolderChange, onCreateLabel }: Props) {
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [labelsExpanded, setLabelsExpanded] = useState(true);
  const [moreExpanded, setMoreExpanded] = useState(false);

  const { emails, currentFolder, labels } = state;

  const inboxCount   = countUnread(emails, e => e.labels.includes('inbox') && !e.isArchived && !e.isTrashed);
  const starredCount = countUnread(emails, e => e.starColor !== 'none' && !e.isTrashed);
  const snoozedCount = emails.filter(e => e.snoozeUntil && !e.isTrashed).length;
  const draftsCount  = 0;

  // Category counts for the sidebar (promotions, social, updates, forums as folders)
  const promotionsCount  = countUnread(emails, e => e.category === 'promotions' && e.labels.includes('inbox') && !e.isArchived && !e.isTrashed);
  const socialCount      = countUnread(emails, e => e.category === 'social'      && e.labels.includes('inbox') && !e.isArchived && !e.isTrashed);
  const updatesCount     = countUnread(emails, e => e.category === 'updates'     && e.labels.includes('inbox') && !e.isArchived && !e.isTrashed);

  const isActive = (id: string) => currentFolder === id;

  const itemClass = (id: string, isNested = false) => `
    w-full flex items-center gap-3 pl-${isNested ? 6 : 4} pr-3 py-1 rounded-r-full text-sm transition-colors cursor-pointer select-none
    ${isActive(id) ? '' : 'hover:bg-gray-100'}
  `.trim();

  const itemStyle = (id: string) => isActive(id)
    ? { background: 'var(--gmail-sidebar-active-bg)', color: 'var(--gmail-sidebar-active-text)' }
    : { color: 'var(--gmail-text)' };

  const iconStyle = (id: string) => ({
    color: isActive(id) ? 'var(--gmail-sidebar-active-text)' : 'var(--gmail-text-secondary)',
  });

  const handleCreateLabel = () => {
    const t = newLabel.trim();
    if (t && !labels.includes(t)) onCreateLabel(t);
    setNewLabel(''); setShowLabelInput(false);
  };

  if (collapsed) {
    return (
      <div className="w-16 flex-shrink-0 py-2 flex flex-col items-center gap-1">
        <div className="w-14 h-12 flex items-center justify-center mb-2">
          <button className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        {[
          { id: 'inbox', Icon: Inbox, count: inboxCount },
          { id: 'starred', Icon: Star, count: starredCount },
          { id: 'snoozed', Icon: Clock, count: snoozedCount },
          { id: 'sent', Icon: Send, count: 0 },
          { id: 'drafts', Icon: FileText, count: draftsCount },
          { id: 'trash', Icon: Trash2, count: 0 },
        ].map(({ id, Icon, count }) => (
          <button
            key={id}
            onClick={() => onFolderChange(id)}
            className="w-full flex flex-col items-center gap-0.5 py-1.5 rounded-r-2xl transition-colors"
            style={itemStyle(id)}
            title={id}
          >
            <Icon size={20} style={iconStyle(id)} />
            {count > 0 && <span className="text-[10px] font-semibold">{count}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-60 flex-shrink-0 py-2 overflow-y-auto" style={{ color: 'var(--gmail-text)' }}>
      {/* Compose */}
      <div className="px-3 mb-3">
        <button
          className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white text-sm font-medium w-full transition-shadow hover:shadow-md"
          style={{ color: 'var(--gmail-text)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Utwórz
        </button>
      </div>

      {/* Main nav */}
      <nav>
        {[
          { id: 'inbox',   label: 'Odebrane',          Icon: Inbox,     count: inboxCount },
          { id: 'starred', label: 'Oznaczone gwiazdką', Icon: Star,      count: starredCount },
          { id: 'snoozed', label: 'Odłożone',           Icon: Clock,     count: snoozedCount },
        ].map(({ id, label, Icon, count }) => (
          <button key={id} onClick={() => onFolderChange(id)} className={itemClass(id)} style={itemStyle(id)}>
            <Icon size={18} className="flex-shrink-0" style={iconStyle(id)} />
            <span className="flex-1 text-left truncate">{label}</span>
            {count > 0 && <span className="text-xs font-semibold">{count}</span>}
          </button>
        ))}

        {/* Ważne */}
        <button onClick={() => onFolderChange('important')} className={itemClass('important')} style={itemStyle('important')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isActive('important') ? 'var(--gmail-sidebar-active-text)' : '#f4b400'} className="flex-shrink-0">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span className="flex-1 text-left">Ważne</span>
        </button>

        {[
          { id: 'sent',   label: 'Wysłane',          Icon: Send,     count: 0 },
          { id: 'drafts', label: 'Wersje robocze',   Icon: FileText, count: draftsCount },
        ].map(({ id, label, Icon, count }) => (
          <button key={id} onClick={() => onFolderChange(id)} className={itemClass(id)} style={itemStyle(id)}>
            <Icon size={18} className="flex-shrink-0" style={iconStyle(id)} />
            <span className="flex-1 text-left truncate">{label}</span>
            {count > 0 && <span className="text-xs font-semibold">{count}</span>}
          </button>
        ))}

        {/* Category folders */}
        {[
          { id: 'category:promotions', label: 'Oferty',         icon: '🏷️', count: promotionsCount },
          { id: 'category:social',     label: 'Społeczności',   icon: '👥', count: socialCount },
          { id: 'category:updates',    label: 'Powiadomienia',  icon: 'ℹ️', count: updatesCount },
          { id: 'category:forums',     label: 'Fora',           icon: '💬', count: 0 },
        ].map(({ id, label, icon, count }) => (
          <button key={id} onClick={() => onFolderChange(id)} className={itemClass(id)} style={itemStyle(id)}>
            <span className="text-base w-[18px] flex-shrink-0 text-center">{icon}</span>
            <span className="flex-1 text-left truncate">{label}</span>
            {count > 0 && <span className="text-xs font-semibold">{count}</span>}
          </button>
        ))}

        <button onClick={() => onFolderChange('trash')} className={itemClass('trash')} style={itemStyle('trash')}>
          <Trash2 size={18} className="flex-shrink-0" style={iconStyle('trash')} />
          <span className="flex-1 text-left">Kosz</span>
        </button>
      </nav>

      {/* Divider */}
      <div className="my-2 mx-4 border-t" style={{ borderColor: 'var(--gmail-border)' }} />

      {/* Labels */}
      <div>
        <div className="flex items-center pl-4 pr-2 py-1 rounded-r-full hover:bg-gray-100 cursor-pointer" style={{ color: 'var(--gmail-text-secondary)' }}>
          <div
            className="flex items-center gap-2 flex-1 text-xs font-semibold uppercase tracking-wide"
            onClick={() => setLabelsExpanded(e => !e)}
          >
            {labelsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Etykiety</span>
          </div>
          <button
            onClick={() => setShowLabelInput(true)}
            className="p-0.5 rounded hover:bg-gray-200 flex-shrink-0"
            title="Nowa etykieta"
          >
            <Plus size={14} />
          </button>
        </div>

        {labelsExpanded && (
          <>
            {labels.map(label => {
              const fid = `label:${label}`;
              const cnt = countUnread(emails, e => e.labels.includes(label) && !e.isTrashed);
              return (
                <button key={label} onClick={() => onFolderChange(fid)} className={itemClass(fid)} style={itemStyle(fid)}>
                  <Tag size={16} className="flex-shrink-0" style={iconStyle(fid)} />
                  <span className="flex-1 text-left truncate">{label}</span>
                  {cnt > 0 && <span className="text-xs font-semibold">{cnt}</span>}
                </button>
              );
            })}

            {showLabelInput && (
              <div className="px-3 mt-1 flex gap-1">
                <input
                  autoFocus
                  className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ borderColor: 'var(--gmail-border)' }}
                  placeholder="Nazwa etykiety..."
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateLabel();
                    if (e.key === 'Escape') { setShowLabelInput(false); setNewLabel(''); }
                  }}
                />
                <button onClick={handleCreateLabel} className="text-white text-xs px-2 py-1 rounded" style={{ background: 'var(--gmail-blue)' }}>OK</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
