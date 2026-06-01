'use client';

import { useState, useRef } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
}

const SUGGESTIONS = [
  { label: 'from:', desc: 'Od nadawcy...' },
  { label: 'category:promotions', desc: 'Wiadomości promocyjne' },
  { label: 'category:updates', desc: 'Powiadomienia' },
  { label: 'has:attachment', desc: 'Z załącznikiem' },
  { label: 'older_than:1m', desc: 'Starsze niż miesiąc' },
  { label: 'larger:10M', desc: 'Załącznik > 10 MB' },
  { label: 'after:2026/01/01', desc: 'Po dacie (RRRR/MM/DD)' },
  { label: 'before:2026/06/01', desc: 'Przed datą (RRRR/MM/DD)' },
  { label: 'is:unread', desc: 'Nieprzeczytane' },
  { label: 'label:', desc: 'Z etykietą...' },
];

export default function SearchBar({ value, onChange, onSubmit }: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastWord = value.split(' ').pop() ?? '';
  const filtered = lastWord
    ? SUGGESTIONS.filter(s => s.label.startsWith(lastWord) && s.label !== lastWord)
    : [];
  const showSuggestions = focused && ((!value && SUGGESTIONS.length > 0) || filtered.length > 0);
  const displaySuggestions = value ? filtered : SUGGESTIONS;

  return (
    <div className="relative w-full">
      <div
        className="flex items-center gap-2 h-11 px-4 rounded-2xl transition-all"
        style={{
          background: focused ? 'white' : 'var(--gmail-search-bg)',
          boxShadow: focused ? '0 1px 3px rgba(0,0,0,0.2), 0 1px 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <Search size={18} style={{ color: 'var(--gmail-text-secondary)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--gmail-text)' }}
          placeholder="Przeszukaj pocztę"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={e => {
            if (e.key === 'Enter') { onSubmit(value); inputRef.current?.blur(); }
            if (e.key === 'Escape') { onChange(''); onSubmit(''); inputRef.current?.blur(); }
          }}
        />
        {value && (
          <button onClick={() => { onChange(''); onSubmit(''); }} style={{ color: 'var(--gmail-text-secondary)', flexShrink: 0 }}>
            <X size={16} />
          </button>
        )}
        <button style={{ color: 'var(--gmail-text-secondary)', flexShrink: 0 }} title="Opcje wyszukiwania">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {showSuggestions && displaySuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl z-50 overflow-hidden py-2"
          style={{ border: '1px solid var(--gmail-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
          <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gmail-text-secondary)' }}>
            Operatory wyszukiwania
          </div>
          {displaySuggestions.map(s => (
            <button
              key={s.label}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
              onClick={() => {
                const parts = value.split(' ');
                parts[parts.length - 1] = s.label;
                const newVal = value ? parts.join(' ') : s.label;
                onChange(newVal);
                onSubmit(newVal);
                inputRef.current?.focus();
              }}
            >
              <code className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'var(--gmail-search-bg)', color: 'var(--gmail-blue)' }}>
                {s.label}
              </code>
              <span className="text-sm" style={{ color: 'var(--gmail-text-secondary)' }}>{s.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
