'use client';

import { useState } from 'react';
import { AppState } from '../types';
import { TASKS, TaskDefinition } from '../lib/tasks';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, HelpCircle, ChevronRight, List, X } from 'lucide-react';

interface Props {
  state: AppState;
  activeTaskIndex: number;
  onSwitch: (index: number) => void;
  onComplete: (index: number) => void;
}

const MODULE_BG: Record<number, string> = {
  1: '#1a73e8',
  2: '#7c3aed',
  3: '#059669',
  4: '#ea8600',
  5: '#dc2626',
};

const MODULE_LIGHT_BG: Record<number, string> = {
  1: '#e8f0fe',
  2: '#ede9fe',
  3: '#d1fae5',
  4: '#fef3c7',
  5: '#fee2e2',
};

const MODULE_LIGHT_TEXT: Record<number, string> = {
  1: '#1e3a8a',
  2: '#4c1d95',
  3: '#064e3b',
  4: '#78350f',
  5: '#7f1d1d',
};

export default function TaskWidget({ state, activeTaskIndex, onSwitch, onComplete }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showList, setShowList] = useState(false);
  const [checkResult, setCheckResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showHints, setShowHints] = useState(false);

  const currentTask: TaskDefinition | undefined = TASKS.find(t => t.id === activeTaskIndex);
  const completedCount = Object.values(state.taskResults).filter(v => v === 'completed').length;
  const allDone = completedCount === TASKS.length;

  const headerBg = currentTask ? (MODULE_BG[currentTask.moduleId] ?? '#1a73e8') : '#059669';

  const handleCheck = () => {
    if (!currentTask) return;
    const result = currentTask.validate(state);
    setCheckResult(result);
    if (result.ok) onComplete(activeTaskIndex);
  };

  const handleSwitch = (idx: number) => {
    setShowList(false);
    setCheckResult(null);
    setShowHints(false);
    onSwitch(idx);
  };

  const goNext = () => {
    const next = TASKS.find(t => t.id !== activeTaskIndex && state.taskResults[t.id] !== 'completed');
    if (next) handleSwitch(next.id);
  };

  // Group by module
  const modules = TASKS.reduce<{ id: number; name: string; tasks: typeof TASKS }[]>((acc, t) => {
    const m = acc.find(x => x.id === t.moduleId);
    if (m) m.tasks.push(t);
    else acc.push({ id: t.moduleId, name: t.moduleName, tasks: [t] });
    return acc;
  }, []);

  return (
    <>
      {/* Task list overlay */}
      {showList && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-5 pointer-events-none">
          <div className="pointer-events-auto w-[720px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ border: '1px solid var(--gmail-border)', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: '1px solid var(--gmail-border)' }}>
              <div>
                <span className="font-bold text-xl" style={{ color: 'var(--gmail-text)' }}>Wszystkie zadania</span>
                <span className="ml-3 text-base" style={{ color: 'var(--gmail-text-secondary)' }}>{completedCount} z {TASKS.length} ukończone</span>
              </div>
              <button onClick={() => setShowList(false)} className="p-2 rounded-full hover:bg-gray-100" style={{ color: 'var(--gmail-text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {modules.map(mod => (
                <div key={mod.id} className="mb-5">
                  <div className="text-sm font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--gmail-text-secondary)' }}>
                    {mod.name.replace(/^Moduł \d+: /, '')}
                  </div>
                  <div className="space-y-1.5">
                    {mod.tasks.map(task => {
                      const isDone = state.taskResults[task.id] === 'completed';
                      const isActive = task.id === activeTaskIndex;
                      const modBg = MODULE_BG[mod.id] ?? '#1a73e8';
                      const lightBg = MODULE_LIGHT_BG[mod.id] ?? '#e8f0fe';
                      const lightText = MODULE_LIGHT_TEXT[mod.id] ?? '#1e3a8a';
                      return (
                        <button
                          key={task.id}
                          onClick={() => handleSwitch(task.id)}
                          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all"
                          style={{
                            background: isActive ? lightBg : isDone ? '#f0fdf4' : 'transparent',
                            color: isActive ? lightText : isDone ? '#166534' : 'var(--gmail-text)',
                            border: isActive ? `1px solid ${modBg}40` : '1px solid transparent',
                          }}
                        >
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold"
                            style={{ background: isDone ? '#16a34a' : isActive ? modBg : '#e0e0e0', color: isDone || isActive ? 'white' : '#757575' }}>
                            {isDone ? '✓' : task.id + 1}
                          </div>
                          <span className="text-lg flex-1 leading-snug">{task.title}</span>
                          {isActive && <ChevronRight size={20} style={{ color: modBg }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main widget */}
      <div className="fixed bottom-5 right-5 w-[720px] bg-white rounded-2xl z-40 overflow-hidden"
        style={{ border: '1px solid var(--gmail-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>

        {allDone ? (
          <>
            <div className="px-6 py-4 text-white" style={{ background: '#059669' }}>
              <div className="flex items-center gap-2">
                <CheckCircle size={22} />
                <span className="font-semibold text-lg">Szkolenie ukończone!</span>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-base text-gray-700 leading-relaxed">
                Gratulacje! Ukończyłeś wszystkie {TASKS.length} zadania i jesteś Gmail Power User! 🎉
              </p>
              <button onClick={() => setShowList(true)} className="mt-3 text-sm font-medium" style={{ color: 'var(--gmail-blue)' }}>
                Zobacz podsumowanie →
              </button>
            </div>
          </>
        ) : currentTask ? (
          <>
            {/* Header */}
            <div
              className="px-6 py-4 text-white cursor-pointer select-none"
              style={{ background: headerBg }}
              onClick={() => setExpanded(e => !e)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-base opacity-80 truncate">{currentTask.moduleName}</div>
                  <div className="font-bold text-2xl truncate mt-1 leading-tight">{currentTask.title}</div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); setShowList(true); }}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    title="Wszystkie zadania"
                  >
                    <List size={22} />
                  </button>
                  <span className="text-base bg-white/20 px-3 py-1 rounded-full font-semibold">
                    {completedCount}/{TASKS.length}
                  </span>
                  {expanded ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                </div>
              </div>
              {/* Progress */}
              <div className="mt-3 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / TASKS.length) * 100}%`, background: 'white' }}
                />
              </div>
            </div>

            {expanded && (
              <div className="px-7 py-6">
                {/* Goal */}
                <div className="mb-5">
                  <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gmail-text-secondary)' }}>Cel zadania</div>
                  <p className="text-lg leading-relaxed" style={{ color: 'var(--gmail-text)' }}>{currentTask.goal}</p>
                </div>

                {/* Instruction */}
                <div className="mb-5">
                  <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gmail-text-secondary)' }}>Do zrobienia</div>
                  <pre className="text-base whitespace-pre-wrap font-sans leading-relaxed px-5 py-4 rounded-xl"
                    style={{ background: 'var(--gmail-search-bg)', color: 'var(--gmail-text)', border: '1px solid var(--gmail-border)' }}>
                    {currentTask.instruction}
                  </pre>
                </div>

                {/* Hints */}
                <button
                  className="flex items-center gap-2 text-base mb-5 transition-colors"
                  style={{ color: showHints ? 'var(--gmail-blue)' : 'var(--gmail-text-secondary)' }}
                  onClick={() => setShowHints(h => !h)}
                >
                  <HelpCircle size={18} />
                  {showHints ? 'Ukryj podpowiedzi' : 'Pokaż podpowiedzi'}
                </button>

                {showHints && (
                  <div className="mb-5 px-5 py-4 rounded-xl space-y-3" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
                    {currentTask.hints.map((hint, i) => (
                      <div key={i} className="flex items-start gap-2 text-base" style={{ color: '#78350f' }}>
                        <span className="font-bold flex-shrink-0">{i + 1}.</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Result */}
                {checkResult && (
                  <div className="mb-4 px-4 py-3 rounded-xl flex items-start gap-3"
                    style={{
                      background: checkResult.ok ? '#f0fdf4' : '#fff1f2',
                      border: `1px solid ${checkResult.ok ? '#86efac' : '#fecdd3'}`,
                    }}>
                    {checkResult.ok
                      ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                      : <XCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#e11d48' }} />}
                    <span className="text-base leading-relaxed" style={{ color: checkResult.ok ? '#166534' : '#9f1239' }}>
                      {checkResult.message}
                    </span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCheck}
                    className="flex-1 text-white text-lg font-semibold py-3.5 px-5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                    style={{ background: headerBg }}
                  >
                    Sprawdź ✓
                  </button>
                  {checkResult?.ok && (
                    <button
                      onClick={goNext}
                      className="flex-1 text-white text-lg font-semibold py-3.5 px-5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                      style={{ background: 'var(--gmail-text)' }}
                    >
                      Następne →
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
