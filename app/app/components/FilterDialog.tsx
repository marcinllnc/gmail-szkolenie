'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Filter, FilterAction } from '../types';

interface Props {
  labels: string[];
  onConfirm: (filter: Omit<Filter, 'id'>) => void;
  onClose: () => void;
}

export default function FilterDialog({ labels, onConfirm, onClose }: Props) {
  const [keyword, setKeyword] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [markRead, setMarkRead] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [archive, setArchive] = useState(false);

  const handleSubmit = () => {
    if (!keyword.trim() && !fromAddress.trim()) return;
    const actions: FilterAction[] = [];
    if (markRead) actions.push({ type: 'markAsRead' });
    if (selectedLabel) actions.push({ type: 'addLabel', label: selectedLabel });
    if (archive) actions.push({ type: 'archive' });

    onConfirm({
      keyword: keyword.trim(),
      fromAddress: fromAddress.trim() || undefined,
      actions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Utwórz filtr</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Słowo kluczowe</label>
            <input
              autoFocus
              type="text"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="np. unsubscribe"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Od nadawcy (opcjonalne)</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="np. newsletter@example.com"
              value={fromAddress}
              onChange={e => setFromAddress(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">Akcje</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markRead}
                  onChange={e => setMarkRead(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm text-gray-700">Oznacz jako przeczytane</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={archive}
                  onChange={e => setArchive(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm text-gray-700">Archiwizuj</span>
              </label>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={!!selectedLabel}
                  onChange={e => !e.target.checked && setSelectedLabel('')}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm text-gray-700">Przypisz etykietę:</span>
                <select
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                  value={selectedLabel}
                  onChange={e => setSelectedLabel(e.target.value)}
                >
                  <option value="">-- wybierz --</option>
                  {labels.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                  <option value="Newslettery">Newslettery (nowa)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            disabled={!keyword.trim() && !fromAddress.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Utwórz filtr
          </button>
        </div>
      </div>
    </div>
  );
}
