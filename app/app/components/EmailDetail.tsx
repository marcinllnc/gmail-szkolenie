'use client';

import { Email, StarColor } from '../types';
import { ArrowLeft, Archive, Trash2, Clock, Tag, MoreVertical, Paperclip, Reply, VolumeX } from 'lucide-react';
import { formatFileSize } from '../lib/searchParser';

const STAR_COLORS: Record<StarColor, string> = {
  none: 'text-gray-300',
  yellow: 'text-yellow-400',
  red: 'text-red-500',
  blue: 'text-blue-500',
  orange: 'text-orange-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
};

const STAR_NEXT: Record<StarColor, StarColor> = {
  none: 'yellow',
  yellow: 'red',
  red: 'blue',
  blue: 'green',
  green: 'purple',
  purple: 'none',
  orange: 'none',
};

interface Props {
  email: Email;
  labels: string[];
  onClose: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMute: () => void;
  onStar: (color: StarColor) => void;
  onSnooze: () => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
}

export default function EmailDetail({
  email, labels, onClose, onArchive, onDelete, onMute, onStar, onSnooze, onAddLabel, onRemoveLabel
}: Props) {
  const date = new Date(email.date);
  const dateStr = date.toLocaleDateString('pl-PL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const emailLabels = email.labels.filter(l => l !== 'inbox' && l !== 'sent');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 mr-2"
          title="Wróć"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={onArchive}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          title="Archiwizuj (E)"
        >
          <Archive size={18} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          title="Usuń"
        >
          <Trash2 size={18} />
        </button>
        <button
          onClick={onSnooze}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          title="Odłóż"
        >
          <Clock size={18} />
        </button>
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600" title="Etykiety">
            <Tag size={18} />
          </button>
          <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-44">
            <div className="py-1 text-xs text-gray-400 px-3 pt-2 font-medium">Etykiety</div>
            {labels.map(label => (
              <label key={label} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={email.labels.includes(label)}
                  onChange={e => e.target.checked ? onAddLabel(label) : onRemoveLabel(label)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600" title="Więcej">
            <MoreVertical size={18} />
          </button>
          <div className="hidden group-hover:block absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-44">
            <button
              onClick={onMute}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <VolumeX size={14} className="text-gray-400" />
              Wycisz wątek
            </button>
          </div>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Subject */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-medium text-gray-900 leading-tight">{email.subject}</h2>
          <button
            onClick={() => onStar(STAR_NEXT[email.starColor])}
            className={`text-xl flex-shrink-0 ${STAR_COLORS[email.starColor]} hover:opacity-80 transition-opacity`}
            title="Gwiazdka"
          >
            {email.starColor === 'none' ? '☆' : '★'}
          </button>
        </div>

        {/* Labels */}
        {emailLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {emailLabels.map(label => (
              <span key={label} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {label}
              </span>
            ))}
          </div>
        )}

        {/* From/Date header */}
        <div className="flex items-start justify-between gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {email.senderName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">{email.senderName}</div>
                <div className="text-xs text-gray-500">&lt;{email.sender}&gt;</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 text-right flex-shrink-0 mt-1">
            {dateStr}
            {email.snoozeUntil && (
              <div className="text-orange-500 mt-1">
                🕐 Odłożone: {new Date(email.snoozeUntil).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">
          {email.body}
        </div>

        {/* Attachment */}
        {email.hasAttachment && (
          <div className="border border-gray-200 rounded-xl p-4 inline-flex items-center gap-3 bg-gray-50">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Paperclip size={18} className="text-red-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">{email.attachmentName || 'Załącznik'}</div>
              <div className="text-xs text-gray-500">
                {email.attachmentSize ? formatFileSize(email.attachmentSize) : 'Nieznany rozmiar'}
              </div>
            </div>
          </div>
        )}

        {/* Reply */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-full transition-colors">
            <Reply size={16} />
            Odpowiedz
          </button>
        </div>
      </div>
    </div>
  );
}
