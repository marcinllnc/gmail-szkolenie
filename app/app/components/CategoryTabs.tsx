'use client';

import { Email, EmailCategory } from '../types';

interface Tab {
  id: EmailCategory | 'primary';
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'primary', label: 'Główne', icon: '🏠' },
  { id: 'promotions', label: 'Oferty', icon: '🏷️' },
  { id: 'social', label: 'Społeczności', icon: '👥' },
  { id: 'updates', label: 'Powiadomienia', icon: 'ℹ️' },
];

interface Props {
  activeCategory: EmailCategory | 'primary';
  emails: Email[];
  onSelect: (cat: EmailCategory | 'primary') => void;
}

export default function CategoryTabs({ activeCategory, emails, onSelect }: Props) {
  function countNew(cat: EmailCategory | 'primary') {
    return emails.filter(e =>
      e.category === cat &&
      !e.isRead &&
      !e.isArchived &&
      !e.isTrashed &&
      e.labels.includes('inbox')
    ).length;
  }

  return (
    <div className="flex border-b" style={{ borderColor: 'var(--gmail-border)' }}>
      {TABS.map(tab => {
        const newCount = countNew(tab.id);
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors select-none"
            style={{
              color: isActive ? 'var(--gmail-blue)' : 'var(--gmail-text-secondary)',
              borderBottom: isActive ? '3px solid var(--gmail-blue)' : '3px solid transparent',
              marginBottom: '-1px',
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{tab.icon}</span>
            <span>{tab.label}</span>
            {newCount > 0 && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: isActive ? 'var(--gmail-blue)' : '#e8eaed', color: isActive ? 'white' : 'var(--gmail-text-secondary)' }}
              >
                {newCount} {newCount === 1 ? 'nowa' : 'nowe'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
