'use client';

import React from 'react';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';
import { SavedRange } from '@/types/calendar';
import { formatDisplayDate } from '@/utils/dateHelpers';
import { CATEGORIES } from '@/utils/categories';

interface FullListPanelProps {
  savedRanges: SavedRange[];
  accentColor: string;
  currentYear: number;
  currentMonth: number;
  onDeleteRange: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onToggleCategory: (id: string, category: string) => void;
  onHoverRange: (id: string | null) => void;
  onClearRange: () => void;
  onSelectRange: (id: string | null) => void;
  selectedRangeId: string | null;
}

function ReminderItem({
  r,
  idx,
  isFocused,
  onHoverRange,
  onToggleComplete,
  onDeleteRange,
  onUpdateNote,
  onToggleCategory,
  onClearRange,
  onSelectRange
}: {
  r: SavedRange,
  idx: number,
  isFocused: boolean,
  onHoverRange: (id: string | null) => void,
  onToggleComplete: (id: string) => void,
  onDeleteRange: (id: string) => void,
  onUpdateNote: (id: string, note: string) => void,
  onToggleCategory: (id: string, category: string) => void,
  onClearRange: () => void,
  onSelectRange: (id: string | null) => void
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isFocused]);

  const activeCategories = CATEGORIES.filter(c => r.categories?.includes(c.id));

  return (
    <div
      onMouseEnter={() => onHoverRange(r.id)}
      onMouseLeave={() => onHoverRange(null)}
      className={`relative flex items-start gap-4 group transition-all duration-300 p-2 rounded-xl hover:bg-white/40 hover:backdrop-blur-sm ${r.completed ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center flex-shrink-0 mt-1">
        <div className="w-1 h-6 rounded-full shadow-sm" style={{ backgroundColor: r.color }} />
      </div>

      <div className="flex-1 min-w-0 border-b border-black/5 pb-2">
        <div className="mb-0.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[10px] font-black tabular-nums text-black/40 flex-shrink-0">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-[12px] font-black text-black uppercase tracking-tight truncate drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] ${r.completed ? 'line-through opacity-70' : ''}`}>
                  {r.start === r.end ? formatDisplayDate(r.start) : `${formatDisplayDate(r.start)} — ${formatDisplayDate(r.end)}`}
                </span>
                {r.completed && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-[8px] font-black rounded uppercase tracking-tighter border border-green-200 shadow-sm inline-block">
                    Done
                  </span>
                )}
              </div>
              {activeCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  {activeCategories.map(cat => (
                    <span
                      key={cat.id}
                      className="text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded-sm bg-black/5"
                      style={{ color: cat.color }}
                    >
                      {cat.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5 ml-2">
            <div className="hidden group-hover:flex items-center gap-1 mr-2 animate-in fade-in slide-in-from-right-2 duration-300">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onToggleCategory(r.id, cat.id)}
                  className={`w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 shadow-sm border border-white ${r.categories?.includes(cat.id) ? 'ring-2 ring-black/20 scale-110' : 'opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: cat.color }}
                  title={cat.label}
                />
              ))}
            </div>

            <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onToggleComplete(r.id)} className={`p-1.5 rounded-lg transition-all ${r.completed ? 'text-green-600 bg-green-50' : 'text-slate-900 hover:bg-green-50 hover:text-green-600'}`}>
                <CheckCircle size={14} />
              </button>
              <button onClick={() => onDeleteRange(r.id)} className="p-1.5 hover:bg-red-50 text-slate-900 hover:text-red-500 rounded-lg transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-transparent rounded-lg py-1 transition-all">
          <textarea
            ref={textareaRef}
            value={r.note}
            onChange={(e) => onUpdateNote(r.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
                onClearRange();
                onSelectRange(null);
              }
            }}
            placeholder="Add details..."
            onBlur={() => {
              if (r.note.trim() === '') {
                onDeleteRange(r.id);
              }
            }}
            className={`w-full bg-transparent border-none p-0 text-[11px] text-slate-950 placeholder:text-black/20 focus:ring-0 resize-none min-h-[20px] font-bold leading-tight hover:underline decoration-black/10 underline-offset-4 transition-all ${r.completed ? 'line-through opacity-50' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}

export default function FullListPanel({
  savedRanges,
  accentColor,
  currentYear,
  currentMonth,
  onDeleteRange,
  onToggleComplete,
  onUpdateNote,
  onToggleCategory,
  onHoverRange,
  onClearRange,
  onSelectRange,
  selectedRangeId,
}: FullListPanelProps) {
  const monthStartKey = React.useMemo(() => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  }, [currentYear, currentMonth]);

  const monthEndKey = React.useMemo(() => {
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }, [currentYear, currentMonth]);

  const monthReminders = React.useMemo(() => {
    const overlapping = savedRanges.filter(r => r.start <= monthEndKey && r.end >= monthStartKey);
    return [...overlapping].sort((a, b) => {
      const compA = a.completed ? 1 : 0;
      const compB = b.completed ? 1 : 0;
      if (compA !== compB) return compA - compB;
      const startA = a.start < monthStartKey ? monthStartKey : a.start;
      const startB = b.start < monthStartKey ? monthStartKey : b.start;
      return startA.localeCompare(startB);
    });
  }, [savedRanges, monthStartKey, monthEndKey]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col pt-8" style={{ background: 'transparent' }}>
      <div className="relative flex-1 flex flex-col overflow-hidden z-10">
        <div className="px-4 py-2 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] drop-shadow-sm" style={{ color: accentColor }}>
            Month Planner
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-1 custom-scrollbar">
          {monthReminders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10 opacity-20">
              <Clock size={16} className="text-slate-900 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Hurrayyy no reminders!!</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {monthReminders.map((r, idx) => (
                <ReminderItem
                  key={r.id}
                  r={r}
                  idx={idx}
                  isFocused={r.id === selectedRangeId}
                  onHoverRange={onHoverRange}
                  onToggleComplete={onToggleComplete}
                  onDeleteRange={onDeleteRange}
                  onUpdateNote={onUpdateNote}
                  onToggleCategory={onToggleCategory}
                  onClearRange={onClearRange}
                  onSelectRange={onSelectRange}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 flex flex-col items-center justify-center border-t border-black/5 bg-white/50 backdrop-blur-sm">
        </div>
      </div>
    </div>
  );
}
