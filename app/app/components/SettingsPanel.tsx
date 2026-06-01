'use client';

import { useState } from 'react';
import { AutoResponder, EmailSignature, EmailTemplate } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface Props {
  autoResponder: AutoResponder;
  signature: EmailSignature;
  templates: EmailTemplate[];
  keyboardShortcutsEnabled: boolean;
  onSaveAutoResponder: (v: AutoResponder) => void;
  onSaveSignature: (v: EmailSignature) => void;
  onSaveTemplate: (t: Omit<EmailTemplate, 'id'>) => void;
  onDeleteTemplate: (id: string) => void;
  onToggleShortcuts: (v: boolean) => void;
  onClose: () => void;
}

type Tab = 'general' | 'autoresponder' | 'signature' | 'templates';

export default function SettingsPanel({
  autoResponder, signature, templates, keyboardShortcutsEnabled,
  onSaveAutoResponder, onSaveSignature, onSaveTemplate, onDeleteTemplate,
  onToggleShortcuts, onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>('general');

  // Auto-responder form state
  const [ar, setAr] = useState<AutoResponder>(autoResponder);
  const [arSaved, setArSaved] = useState(false);

  // Signature form state
  const [sig, setSig] = useState<EmailSignature>(signature);
  const [sigSaved, setSigSaved] = useState(false);

  // Template form state
  const [newTpl, setNewTpl] = useState({ name: '', subject: '', body: '' });
  const [tplSaved, setTplSaved] = useState(false);
  const [showNewTpl, setShowNewTpl] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'Ogólne' },
    { id: 'autoresponder', label: 'Auto-responder' },
    { id: 'signature', label: 'Stopka' },
    { id: 'templates', label: 'Szablony' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Ustawienia</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* ── General ── */}
          {tab === 'general' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">Skróty klawiszowe</div>
                  <div className="text-xs text-gray-500 mt-0.5">J/K (nawigacja), E (archiwizuj), / (szukaj)</div>
                </div>
                <button
                  onClick={() => onToggleShortcuts(!keyboardShortcutsEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${keyboardShortcutsEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${keyboardShortcutsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="py-3 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900 mb-1">Filtry i zablokowane adresy</div>
                <p className="text-xs text-gray-500">Zarządzaj filtrami w dolnej części listy maili (przycisk "Utwórz filtr").</p>
              </div>
              <div className="py-3">
                <div className="text-sm font-medium text-gray-900 mb-1">Motyw</div>
                <p className="text-xs text-gray-500">Aktywny: Standardowy (jasny). Ciemny motyw wkrótce.</p>
              </div>
            </div>
          )}

          {/* ── Auto-responder ── */}
          {tab === 'autoresponder' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Włącz auto-responder</div>
                  <div className="text-xs text-gray-500 mt-0.5">Automatyczna odpowiedź podczas nieobecności</div>
                </div>
                <button
                  onClick={() => setAr(a => ({ ...a, enabled: !a.enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${ar.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${ar.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className={`space-y-3 transition-opacity ${ar.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Data od</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={ar.startDate}
                    onChange={e => setAr(a => ({ ...a, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Data do</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={ar.endDate}
                    onChange={e => setAr(a => ({ ...a, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Temat wiadomości</label>
                  <input
                    type="text"
                    placeholder="np. Jestem na urlopie do 10 czerwca"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={ar.subject}
                    onChange={e => setAr(a => ({ ...a, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Treść odpowiedzi</label>
                  <textarea
                    rows={4}
                    placeholder="np. Dziękuję za wiadomość. Jestem niedostępny do 10 czerwca. W pilnych sprawach proszę kontaktować się z..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                    value={ar.body}
                    onChange={e => setAr(a => ({ ...a, body: e.target.value }))}
                  />
                </div>
              </div>

              {arSaved && (
                <div className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                  ✓ Auto-responder zapisany pomyślnie
                </div>
              )}

              <button
                onClick={() => { onSaveAutoResponder(ar); setArSaved(true); setTimeout(() => setArSaved(false), 2000); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                Zapisz ustawienia
              </button>
            </div>
          )}

          {/* ── Signature ── */}
          {tab === 'signature' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Włącz stopkę</div>
                  <div className="text-xs text-gray-500 mt-0.5">Dodawana automatycznie do każdej nowej wiadomości</div>
                </div>
                <button
                  onClick={() => setSig(s => ({ ...s, enabled: !s.enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${sig.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${sig.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className={`transition-opacity ${sig.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Treść stopki</label>
                <textarea
                  rows={6}
                  placeholder={'Jan Kowalski\nSenior Developer\nFirma sp. z o.o.\n\ntel. +48 500 123 456\njan.kowalski@firma.pl'}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none font-mono"
                  value={sig.content}
                  onChange={e => setSig(s => ({ ...s, content: e.target.value }))}
                />
                <div className="mt-2 text-xs text-gray-400">
                  Podgląd:
                </div>
                {sig.content && (
                  <div className="mt-1 border-t border-gray-200 pt-2 text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 px-3 py-2 rounded-lg">
                    {sig.content}
                  </div>
                )}
              </div>

              {sigSaved && (
                <div className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                  ✓ Stopka zapisana pomyślnie
                </div>
              )}

              <button
                onClick={() => { onSaveSignature(sig); setSigSaved(true); setTimeout(() => setSigSaved(false), 2000); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                Zapisz stopkę
              </button>
            </div>
          )}

          {/* ── Templates ── */}
          {tab === 'templates' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-900">Szablony odpowiedzi</div>
                  <div className="text-xs text-gray-500 mt-0.5">Szybkie odpowiedzi na powtarzające się pytania</div>
                </div>
                <button
                  onClick={() => setShowNewTpl(true)}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={12} />
                  Nowy
                </button>
              </div>

              {/* Existing templates */}
              {templates.length === 0 && !showNewTpl && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-sm">Brak szablonów. Utwórz pierwszy!</p>
                </div>
              )}

              {templates.map(tpl => (
                <div key={tpl.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{tpl.name}</div>
                      {tpl.subject && (
                        <div className="text-xs text-gray-500 mt-0.5">Temat: {tpl.subject}</div>
                      )}
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">{tpl.body}</div>
                    </div>
                    <button
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* New template form */}
              {showNewTpl && (
                <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
                  <div className="text-sm font-medium text-blue-900">Nowy szablon</div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Nazwa szablonu</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="np. Podziękowanie"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                      value={newTpl.name}
                      onChange={e => setNewTpl(t => ({ ...t, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Temat (opcjonalnie)</label>
                    <input
                      type="text"
                      placeholder="np. Re: Twoja wiadomość"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                      value={newTpl.subject}
                      onChange={e => setNewTpl(t => ({ ...t, subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Treść</label>
                    <textarea
                      rows={3}
                      placeholder="np. Dziękuję za wiadomość. Odpiszę w ciągu 24 godzin."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
                      value={newTpl.body}
                      onChange={e => setNewTpl(t => ({ ...t, body: e.target.value }))}
                    />
                  </div>

                  {tplSaved && (
                    <div className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                      ✓ Szablon zapisany!
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowNewTpl(false); setNewTpl({ name: '', subject: '', body: '' }); }}
                      className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={() => {
                        if (!newTpl.name.trim() || !newTpl.body.trim()) return;
                        onSaveTemplate(newTpl);
                        setTplSaved(true);
                        setTimeout(() => { setTplSaved(false); setShowNewTpl(false); setNewTpl({ name: '', subject: '', body: '' }); }, 1000);
                      }}
                      disabled={!newTpl.name.trim() || !newTpl.body.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      Zapisz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
