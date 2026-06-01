'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppState, Email, StarColor, Filter, EmailCategory,
  AutoResponder, EmailSignature, EmailTemplate,
} from '../types';
import { INITIAL_EMAILS, INITIAL_LABELS } from '../data';
import { filterEmails } from '../lib/searchParser';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import Toolbar from './Toolbar';
import CategoryTabs from './CategoryTabs';
import TaskWidget from './TaskWidget';
import SnoozeDialog from './SnoozeDialog';
import FilterDialog from './FilterDialog';
import SettingsPanel from './SettingsPanel';

function getVisibleEmails(
  emails: Email[],
  folder: string,
  searchQuery: string,
  activeCategory: EmailCategory | 'primary'
): Email[] {
  let result = emails;

  if (!searchQuery.trim()) {
    if (folder === 'inbox') {
      result = emails.filter(e =>
        e.labels.includes('inbox') &&
        !e.isArchived && !e.isTrashed && !e.isMuted &&
        e.category === activeCategory
      );
    } else if (folder === 'starred')   result = emails.filter(e => e.starColor !== 'none' && !e.isTrashed);
    else if (folder === 'snoozed')     result = emails.filter(e => !!e.snoozeUntil && !e.isTrashed);
    else if (folder === 'important')   result = emails.filter(e => e.starColor !== 'none' && !e.isTrashed);
    else if (folder === 'trash')       result = emails.filter(e => e.isTrashed);
    else if (folder === 'sent')        result = emails.filter(e => e.labels.includes('sent'));
    else if (folder.startsWith('label:')) {
      const label = folder.slice(6);
      result = emails.filter(e => e.labels.includes(label) && !e.isTrashed);
    } else if (folder.startsWith('category:')) {
      const cat = folder.slice(9);
      result = emails.filter(e => e.category === cat && !e.isTrashed && !e.isArchived);
    }
  } else {
    result = filterEmails(emails.filter(e => !e.isTrashed), searchQuery);
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function GmailSimulator() {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [labels, setLabels] = useState<string[]>(INITIAL_LABELS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openEmailId, setOpenEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [activeCategory, setActiveCategory] = useState<EmailCategory | 'primary'>('primary');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [taskResults, setTaskResults] = useState<Record<number, 'completed' | 'failed'>>({});
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(false);
  const [keyboardActionsUsed, setKeyboardActionsUsed] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showSnoozeDialog, setShowSnoozeDialog] = useState(false);
  const [snoozeTargetId, setSnoozeTargetId] = useState<string | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [autoResponder, setAutoResponder] = useState<AutoResponder>({
    enabled: false, subject: '', body: '', startDate: '', endDate: '',
  });
  const [signature, setSignature] = useState<EmailSignature>({ enabled: false, content: '' });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [status, setStatus] = useState<'available' | 'away' | 'dnd'>('away');

  const visibleEmails = getVisibleEmails(emails, currentFolder, searchQuery, activeCategory);

  const appState: AppState = {
    emails, labels, selectedIds, openEmailId, searchQuery,
    currentFolder, activeTaskIndex, keyboardShortcutsEnabled,
    keyboardActionsUsed, filters, taskResults,
    showSnoozeDialog, showFilterDialog, focusedEmailIndex: focusedIndex,
    autoResponder, signature, templates,
  };

  // ── mutations ─────────────────────────────────────────────────────────────

  const archiveEmails = useCallback((ids: string[]) => {
    setEmails(prev => prev.map(e =>
      ids.includes(e.id) ? { ...e, isArchived: true, labels: e.labels.filter(l => l !== 'inbox') } : e
    ));
    setSelectedIds([]);
    setOpenEmailId(cur => (cur && ids.includes(cur) ? null : cur));
  }, []);

  const deleteEmails = useCallback((ids: string[]) => {
    setEmails(prev => prev.map(e => ids.includes(e.id) ? { ...e, isTrashed: true } : e));
    setSelectedIds([]);
    setOpenEmailId(cur => (cur && ids.includes(cur) ? null : cur));
  }, []);

  const muteEmail = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isMuted: true } : e));
    setOpenEmailId(cur => (cur === id ? null : cur));
  }, []);

  const markRead = useCallback((ids: string[], isRead: boolean) => {
    setEmails(prev => prev.map(e => ids.includes(e.id) ? { ...e, isRead } : e));
  }, []);

  const starEmail = useCallback((id: string, color: StarColor) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starColor: color } : e));
  }, []);

  const snoozeEmail = useCallback((id: string, date: Date) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, snoozeUntil: date.toISOString() } : e));
  }, []);

  const addLabelToEmails = useCallback((ids: string[], label: string) => {
    setEmails(prev => prev.map(e =>
      ids.includes(e.id) && !e.labels.includes(label) ? { ...e, labels: [...e.labels, label] } : e
    ));
    setLabels(prev => prev.includes(label) ? prev : [...prev, label]);
  }, []);

  const removeLabelFromEmail = useCallback((id: string, label: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, labels: e.labels.filter(l => l !== label) } : e));
  }, []);

  const openEmail = useCallback((id: string) => {
    setOpenEmailId(id);
    markRead([id], true);
  }, [markRead]);

  // ── keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;
    const addKey = (k: string) => setKeyboardActionsUsed(prev => prev.includes(k) ? prev : [...prev, k]);
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'j') { e.preventDefault(); addKey('j'); setFocusedIndex(p => Math.min(p + 1, visibleEmails.length - 1)); }
      else if (e.key === 'k') { e.preventDefault(); addKey('k'); setFocusedIndex(p => Math.max(p - 1, 0)); }
      else if (e.key === 'e') {
        e.preventDefault(); addKey('e');
        const id = openEmailId ?? visibleEmails[focusedIndex]?.id;
        if (id) archiveEmails([id]);
      } else if (e.key === '/') {
        e.preventDefault(); addKey('/');
        (document.querySelector('input[placeholder="Przeszukaj pocztę"]') as HTMLInputElement)?.focus();
      } else if (e.key === 'Enter' && !openEmailId && visibleEmails[focusedIndex]) {
        openEmail(visibleEmails[focusedIndex].id);
      } else if (e.key === 'Escape' && openEmailId) {
        setOpenEmailId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyboardShortcutsEnabled, visibleEmails, focusedIndex, openEmailId, archiveEmails, openEmail]);

  // ── filter creation ───────────────────────────────────────────────────────

  const handleCreateFilter = (data: Omit<Filter, 'id'>) => {
    const newFilter: Filter = { ...data, id: `f-${Date.now()}` };
    setFilters(prev => [...prev, newFilter]);
    if (!labels.includes('Newslettery')) setLabels(prev => [...prev, 'Newslettery']);
    setEmails(prev => prev.map(email => {
      const hit =
        (data.keyword && (email.body.toLowerCase().includes(data.keyword.toLowerCase()) || email.subject.toLowerCase().includes(data.keyword.toLowerCase()))) ||
        (data.fromAddress && email.sender.toLowerCase().includes(data.fromAddress.toLowerCase()));
      if (!hit) return email;
      let updated = { ...email };
      for (const action of data.actions) {
        if (action.type === 'markAsRead') updated = { ...updated, isRead: true };
        if (action.type === 'archive') updated = { ...updated, isArchived: true, labels: updated.labels.filter(l => l !== 'inbox') };
        if (action.type === 'addLabel' && action.label && !updated.labels.includes(action.label))
          updated = { ...updated, labels: [...updated.labels, action.label] };
      }
      return updated;
    }));
  };

  const openEmailObj = openEmailId ? emails.find(e => e.id === openEmailId) ?? null : null;

  const allSelected = visibleEmails.length > 0 && selectedIds.length === visibleEmails.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const STATUS_LABELS = { available: 'Dostępny', away: 'Nieobecny', dnd: 'Nie przeszkadzać' };
  const STATUS_COLORS = { available: '#34a853', away: '#9aa0a6', dnd: '#ea4335' };

  const showCategoryTabs = currentFolder === 'inbox' && !searchQuery;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--gmail-bg)' }}>

      {/* ── Header ── */}
      <header className="flex items-center gap-2 px-2 bg-white flex-shrink-0 h-16" style={{ borderBottom: '1px solid var(--gmail-border)' }}>
        {/* Hamburger + logo */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100"
            style={{ color: 'var(--gmail-text-secondary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect y="5" width="24" height="2" rx="1"/>
              <rect y="11" width="24" height="2" rx="1"/>
              <rect y="17" width="24" height="2" rx="1"/>
            </svg>
          </button>
          {/* Gmail logo */}
          <div className="flex items-center gap-1.5 px-1 min-w-[100px]">
            <svg viewBox="0 0 36 28" className="w-9 h-7 flex-shrink-0">
              <rect width="36" height="28" rx="2" fill="#EA4335"/>
              <path d="M0 4l18 12L36 4" stroke="white" strokeWidth="2.5" fill="none"/>
            </svg>
            <span className="text-xl font-normal" style={{ color: '#5f6368', letterSpacing: '-0.5px' }}>Gmail</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={q => { setSearchQuery(q); setOpenEmailId(null); setSelectedIds([]); }}
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          {/* Status */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 text-sm" style={{ color: 'var(--gmail-text-secondary)', border: '1px solid var(--gmail-border)' }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] }} />
              <span>{STATUS_LABELS[status]}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="hidden group-hover:block absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl z-50 w-44 py-1"
              style={{ border: '1px solid var(--gmail-border)' }}>
              {(Object.entries(STATUS_LABELS) as [typeof status, string][]).map(([k, v]) => (
                <button key={k} onClick={() => setStatus(k)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50" style={{ color: 'var(--gmail-text)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[k] }} />
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100" style={{ color: 'var(--gmail-text-secondary)' }} title="Pomoc">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/></svg>
          </button>

          <button onClick={() => setShowSettings(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100" style={{ color: 'var(--gmail-text-secondary)' }} title="Ustawienia">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>

          {/* Apps grid */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100" style={{ color: 'var(--gmail-text-secondary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="4" height="4" rx="0.5"/><rect x="10" y="3" width="4" height="4" rx="0.5"/><rect x="17" y="3" width="4" height="4" rx="0.5"/>
              <rect x="3" y="10" width="4" height="4" rx="0.5"/><rect x="10" y="10" width="4" height="4" rx="0.5"/><rect x="17" y="10" width="4" height="4" rx="0.5"/>
              <rect x="3" y="17" width="4" height="4" rx="0.5"/><rect x="10" y="17" width="4" height="4" rx="0.5"/><rect x="17" y="17" width="4" height="4" rx="0.5"/>
            </svg>
          </button>

          <button className="w-9 h-9 ml-1 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium select-none">M</button>
        </div>
      </header>

      {/* Auto-responder banner */}
      {autoResponder.enabled && (
        <div className="flex items-center gap-2 px-4 py-2 text-sm flex-shrink-0" style={{ background: '#fef9c3', borderBottom: '1px solid #fde68a', color: '#92400e' }}>
          <span>⚡</span>
          <span>Auto-responder aktywny: <strong>{autoResponder.subject}</strong></span>
          <button onClick={() => setAutoResponder(a => ({ ...a, enabled: false }))} className="ml-auto text-xs underline">Wyłącz</button>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        <Sidebar
          state={appState}
          collapsed={sidebarCollapsed}
          onFolderChange={folder => {
            setCurrentFolder(folder);
            setSearchQuery(''); setSearchInput('');
            setOpenEmailId(null); setSelectedIds([]);
            if (folder === 'inbox') setActiveCategory('primary');
          }}
          onCreateLabel={name => setLabels(prev => [...prev, name])}
        />

        {/* Main panel */}
        <div className="flex-1 flex flex-col overflow-hidden mx-2 mb-2 rounded-2xl bg-white" style={{ border: '1px solid var(--gmail-border)' }}>
          {openEmailObj ? (
            <EmailDetail
              email={openEmailObj}
              labels={labels}
              onClose={() => setOpenEmailId(null)}
              onArchive={() => archiveEmails([openEmailObj.id])}
              onDelete={() => deleteEmails([openEmailObj.id])}
              onMute={() => muteEmail(openEmailObj.id)}
              onStar={color => starEmail(openEmailObj.id, color)}
              onSnooze={() => { setSnoozeTargetId(openEmailObj.id); setShowSnoozeDialog(true); }}
              onAddLabel={label => addLabelToEmails([openEmailObj.id], label)}
              onRemoveLabel={label => removeLabelFromEmail(openEmailObj.id, label)}
            />
          ) : (
            <>
              <Toolbar
                totalCount={visibleEmails.length}
                selectedCount={selectedIds.length}
                labels={labels}
                allSelected={allSelected}
                someSelected={someSelected}
                onSelectAll={checked => setSelectedIds(checked ? visibleEmails.map(e => e.id) : [])}
                onArchive={() => archiveEmails(selectedIds)}
                onDelete={() => deleteEmails(selectedIds)}
                onMarkRead={() => markRead(selectedIds, true)}
                onMarkUnread={() => markRead(selectedIds, false)}
                onAddLabel={label => addLabelToEmails(selectedIds, label)}
              />

              {showCategoryTabs && (
                <CategoryTabs
                  activeCategory={activeCategory}
                  emails={emails}
                  onSelect={cat => { setActiveCategory(cat); setSelectedIds([]); setOpenEmailId(null); }}
                />
              )}

              <EmailList
                emails={visibleEmails}
                selectedIds={selectedIds}
                openEmailId={openEmailId}
                focusedIndex={focusedIndex}
                keyboardShortcutsEnabled={keyboardShortcutsEnabled}
                onSelect={(id, checked) => setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
                onSelectAll={checked => setSelectedIds(checked ? visibleEmails.map(e => e.id) : [])}
                onOpen={id => { openEmail(id); setFocusedIndex(visibleEmails.findIndex(e => e.id === id)); }}
                onStar={starEmail}
                onSnooze={id => { setSnoozeTargetId(id); setShowSnoozeDialog(true); }}
                onMute={muteEmail}
              />

              <div className="px-4 py-2 border-t flex-shrink-0" style={{ borderColor: 'var(--gmail-border)' }}>
                <button onClick={() => setShowFilterDialog(true)} className="text-sm hover:underline" style={{ color: 'var(--gmail-blue)' }}>
                  + Utwórz filtr
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {showSnoozeDialog && (
        <SnoozeDialog
          onConfirm={date => { if (snoozeTargetId) snoozeEmail(snoozeTargetId, date); setSnoozeTargetId(null); }}
          onClose={() => { setShowSnoozeDialog(false); setSnoozeTargetId(null); }}
        />
      )}
      {showFilterDialog && (
        <FilterDialog labels={labels} onConfirm={handleCreateFilter} onClose={() => setShowFilterDialog(false)} />
      )}
      {showSettings && (
        <SettingsPanel
          autoResponder={autoResponder}
          signature={signature}
          templates={templates}
          keyboardShortcutsEnabled={keyboardShortcutsEnabled}
          onSaveAutoResponder={setAutoResponder}
          onSaveSignature={setSignature}
          onSaveTemplate={tpl => setTemplates(prev => [...prev, { ...tpl, id: `tpl-${Date.now()}` }])}
          onDeleteTemplate={id => setTemplates(prev => prev.filter(t => t.id !== id))}
          onToggleShortcuts={setKeyboardShortcutsEnabled}
          onClose={() => setShowSettings(false)}
        />
      )}

      {keyboardShortcutsEnabled && (
        <div className="fixed bottom-6 left-64 text-sm px-4 py-2 rounded-lg z-30" style={{ background: 'rgba(32,33,36,0.85)', color: 'white' }}>
          J/K: nawiguj · E: archiwizuj · /: szukaj · Enter: otwórz
        </div>
      )}

      <TaskWidget
        state={appState}
        activeTaskIndex={activeTaskIndex}
        onSwitch={setActiveTaskIndex}
        onComplete={idx => setTaskResults(prev => ({ ...prev, [idx]: 'completed' }))}
      />
    </div>
  );
}
