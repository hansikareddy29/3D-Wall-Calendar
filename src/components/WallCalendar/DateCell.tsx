'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDay, SavedRange } from '@/types/calendar';
import { isSameDay, isInRange, getEffectiveRange, getDayDateKey } from '@/utils/dateHelpers';

interface DateCellProps {
  day: CalendarDay;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  phase: 'idle' | 'selecting';
  accentColor: string;
  onDateClick: (date: Date) => void;
  onDateDoubleClick?: (date: Date) => void;
  onDateHover: (date: Date | null) => void;
  colIndex: number; // 0=Mon...6=Sun
  savedRanges: SavedRange[];
  onSelectRange: (id: string | null) => void;
  selectedRangeId: string | null;
  nextRangeColor: string;
  hoveredRange: SavedRange | null;
}

export default function DateCell({
  day,
  rangeStart,
  rangeEnd,
  hoverDate,
  phase,
  accentColor,
  onDateClick,
  onDateDoubleClick,
  onDateHover,
  colIndex,
  savedRanges,
  onSelectRange,
  selectedRangeId,
  nextRangeColor,
  hoveredRange,
}: DateCellProps) {
  const { effectiveStart, effectiveEnd } = getEffectiveRange(rangeStart, rangeEnd, phase === 'selecting' ? hoverDate : null);

  const isStart = effectiveStart ? isSameDay(day.date, effectiveStart) : false;
  const isEnd = effectiveEnd ? isSameDay(day.date, effectiveEnd) : false;
  const isInRng = isInRange(day.date, effectiveStart, effectiveEnd);
  const isHovered = hoverDate ? isSameDay(day.date, hoverDate) : false;

  const isSat = colIndex === 5;
  const isSun = colIndex === 6;
  const isWeekend = isSat || isSun;

  const isEdge = isStart || isEnd;

  const dateKey = getDayDateKey(day.date);

  // Find unique, active ranges where this day is an endpoint
  const relevantRanges = useMemo(() => {
    const activeRanges = savedRanges.filter(r => !r.completed);
    const startOfRanges = activeRanges.filter(r => r.start === dateKey);
    const endOfRanges = activeRanges.filter(r => r.end === dateKey);
    const combined = [...startOfRanges, ...endOfRanges];
    // Deduplicate by ID
    const uniqueMap = new Map();
    combined.forEach(r => uniqueMap.set(r.id, r));
    return Array.from(uniqueMap.values());
  }, [savedRanges, dateKey]);

  const isSavedEdge = relevantRanges.length > 0;

  // Determine the color for the text
  const finalColor = useMemo(() => {
    if (isEdge) return '#fff';
    if (!day.isCurrentMonth) return undefined;

    // Use accent color for all current month dates
    return accentColor;
  }, [isEdge, day.isCurrentMonth, accentColor]);

  // Stable tilt
  const tilt = useMemo(() => {
    return (day.date.getDate() % 10) - 5;
  }, [day.date]);

  const isPast = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day.date < today;
  }, [day.date]);

  let dayTextColor = '';
  if (!day.isCurrentMonth) {
    dayTextColor = 'opacity-40 font-normal';
  } else if (isPast) {
    dayTextColor = 'opacity-40 font-normal';
  } else if (isEdge) {
    dayTextColor = 'text-white font-black';
  } else {
    dayTextColor = 'font-bold opacity-100';
  }

  const hoverStatus = useMemo(() => {
    if (!hoveredRange) return { isStart: false, isEnd: false, isMiddle: false, isIn: false };
    const dateK = getDayDateKey(day.date);
    const isS = dateK === hoveredRange.start;
    const isE = dateK === hoveredRange.end;
    
    // Middle detection
    const start = new Date(hoveredRange.start);
    const end = new Date(hoveredRange.end);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const d = new Date(day.date);
    d.setHours(0, 0, 0, 0);
    const isM = d > start && d < end;
    
    return { isStart: isS, isEnd: isE, isMiddle: isM, isIn: isS || isE || isM };
  }, [hoveredRange, day.date]);

  return (
    <motion.button
      whileHover={{ scale: !isPast ? 1.05 : 1 }}
      whileTap={{ scale: isPast ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={() => !isPast && onDateClick(day.date)}
      onDoubleClick={() => !isPast && onDateDoubleClick?.(day.date)}
      onMouseEnter={() => !isPast && onDateHover(day.date)}
      onMouseLeave={() => !isPast && onDateHover(null)}
      className={[
        'relative flex items-center justify-center text-sm font-medium',
        'w-full aspect-square max-w-[42px] mx-auto rounded-xl select-none transition-all duration-150',
        isPast ? 'cursor-not-allowed' : 'cursor-pointer',
        !day.isCurrentMonth ? 'opacity-30' : '',
        day.isToday && !isEdge ? 'bg-black/5 shadow-inner underline decoration-2' : '',
        isEdge ? 'z-30 shadow-md scale-105' : 'z-10',
        isSavedEdge ? 'ring-2 ring-offset-2 ring-transparent group' : '',
      ].join(' ')}
      style={{
        backgroundColor: isEdge
          ? nextRangeColor
          : isInRng
            ? `${nextRangeColor}15`
            : isHovered && phase === 'selecting'
              ? `${nextRangeColor}10`
              : 'transparent',
        color: (hoverStatus.isStart || hoverStatus.isEnd) ? '#fff' : finalColor,
      }}
      aria-label={`${day.date.toDateString()}`}
      aria-pressed={isEdge}
    >
      <span className={['relative z-10', dayTextColor].join(' ')}>
        {day.dayOfMonth}
      </span>

      {/* Hover Range Highlight Solid at ends and translucent in the middle */}
      <AnimatePresence>
        {hoverStatus.isIn && (
          <>
            {/* The translucent background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-y-1 z-0 pointer-events-none ${
                hoverStatus.isMiddle ? 'inset-x-0' : 
                hoverStatus.isStart ? 'left-1/2 right-0' : 
                hoverStatus.isEnd ? 'left-0 right-1/2' : ''
              }`}
              style={{ 
                backgroundColor: hoverStatus.isMiddle || (hoverStatus.isStart && !hoverStatus.isEnd) || (hoverStatus.isEnd && !hoverStatus.isStart)
                  ? `${hoveredRange?.color}15`
                  : 'transparent'
              }}
            />

            {/* Solid Circle for Start and End */}
            {(hoverStatus.isStart || hoverStatus.isEnd) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 rounded-xl z-0 pointer-events-none"
                style={{ 
                  backgroundColor: hoveredRange?.color,
                  boxShadow: `0 4px 12px ${hoveredRange?.color}40`,
                  border: '2px solid white'
                }}
              />
            )}
            
            {/* Tooltip on the first day of the hovered range */}
            {hoverStatus.isStart && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap"
              >
                <div className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded shadow-xl border border-white/10 flex items-center gap-2">
                  <span className="truncate max-w-[120px]">{hoveredRange?.note || "Event"}</span>
                  <span className="opacity-60 border-l border-white/20 pl-2">
                    {hoveredRange?.start === hoveredRange?.end ? 'All Day' : (() => {
                      const start = new Date(hoveredRange!.start);
                      const end = new Date(hoveredRange!.end);
                      const days = Math.round(Math.abs(end.getTime() - start.getTime()) / 86400000) + 1;
                      return `${days} Days`;
                    })()}
                  </span>
                </div>
                {/* Tooltip arrow */}
                <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white/10" />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* High-Density Reminder Indicators */}
      {isSavedEdge && day.isCurrentMonth && (() => {
        // Grouping logic
        const singles = relevantRanges.filter(r => r.start === r.end);
        const starts = relevantRanges.filter(r => r.start === dateKey && r.start !== r.end);
        const ends = relevantRanges.filter(r => r.end === dateKey && r.start !== r.end);

        const renderGroup = (items: typeof relevantRanges, type: 'start' | 'end' | 'single') => {
          if (items.length === 0) return null;
          const displayItems = items.slice(0, 3);
          const residue = items.length - 3;
          
          const getSymbol = (type: 'start' | 'end' | 'single') => {
            if (type === 'start') {
              return (
                <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor" style={{ display: 'block' }}>
                  <path d="M0 0 L6 4 L0 8 Z" />
                </svg>
              );
            }
            if (type === 'end') {
              return (
                <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor" style={{ display: 'block' }}>
                  <path d="M6 0 L0 4 L6 8 Z" />
                </svg>
              );
            }
            return (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" style={{ display: 'block' }}>
                <circle cx="3" cy="3" r="3" />
              </svg>
            );
          };

          return (
            <div className={`flex ${type === 'single' ? 'flex-row' : 'flex-col'} items-center gap-[2px]`}>
              {displayItems.map(r => {
                const isSelected = r.id === selectedRangeId;
                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-center transition-all duration-200 ${isSelected ? 'scale-125 brightness-125 z-10' : 'opacity-90'}`}
                    style={{ color: r.color }}
                  >
                    {getSymbol(type)}
                  </div>
                );
              })}
              {residue > 0 && (
                <span className="text-[6px] font-bold text-slate-500 leading-none">+{residue}</span>
              )}
            </div>
          );
        };

        return (
          <div className="absolute inset-0 pointer-events-none p-0.5">
            {/* Left side: ENDS */}
            <div className="absolute left-0.5 top-1/2 -translate-y-1/2 z-20">
              {renderGroup(ends, 'end')}
            </div>

            {/* Right side: STARTS */}
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 z-20">
              {renderGroup(starts, 'start')}
            </div>

            {/* Bottom: SINGLES */}
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 z-20">
              {renderGroup(singles, 'single')}
            </div>
          </div>
        );
      })()}

      {/* Today indicator */}
      {day.isToday && day.isCurrentMonth && (
        <div 
          className="absolute inset-0 border-[1.5px] border-slate-800 rounded-xl pointer-events-none opacity-90 shadow-sm"
        />
      )}
    </motion.button>
  );
}
