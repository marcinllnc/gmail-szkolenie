'use client';

import { X } from 'lucide-react';

interface Props {
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

export default function SnoozeDialog({ onConfirm, onClose }: Props) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(8, 0, 0, 0);

  const thisEvening = new Date();
  thisEvening.setHours(18, 0, 0, 0);

  const options = [
    { label: 'Wieczór (18:00)', date: thisEvening },
    { label: 'Jutro (8:00)', date: tomorrow },
    { label: 'Za tydzień (8:00)', date: nextWeek },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Odłóż na później</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {options.map(({ label, date }) => (
            <button
              key={label}
              onClick={() => { onConfirm(date); onClose(); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-50 text-left border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800">{label}</span>
              <span className="text-xs text-gray-400">
                {date.toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <input
            type="datetime-local"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            defaultValue={`${tomorrow.toISOString().slice(0, 10)}T08:00`}
            onChange={e => {
              if (e.target.value) {
                const d = new Date(e.target.value);
                if (!isNaN(d.getTime())) onConfirm(d);
              }
            }}
          />
          <button
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
            onClick={() => {
              const input = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
              if (input?.value) {
                const d = new Date(input.value);
                if (!isNaN(d.getTime())) { onConfirm(d); onClose(); }
              }
            }}
          >
            Odłóż
          </button>
        </div>
      </div>
    </div>
  );
}
