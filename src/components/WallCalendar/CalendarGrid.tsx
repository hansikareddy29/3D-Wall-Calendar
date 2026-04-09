'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DateCell from './DateCell';
import { MonthData } from '@/types/calendar';
import { DateRange, SelectionPhase } from '@/types/calendar';
import { SavedRange } from '@/types/calendar';
import { DAYS_OF_WEEK } from '@/utils/dateHelpers';

interface CalendarGridProps {
  monthData: MonthData;
  range: DateRange;
  hoverDate: Date | null;
  phase: SelectionPhase;
  accentColor: string;
  direction: number;
  onDateClick: (date: Date) => void;
  onDateDoubleClick?: (date: Date) => void;
  onDateHover: (date: Date | null) => void;
  savedRanges: SavedRange[];
  onSelectRange: (id: string | null) => void;
  selectedRangeId: string | null;
  nextRangeColor: string;
  hoveredRange: SavedRange | null;
}

export default function CalendarGrid({
  monthData,
  range,
  hoverDate,
  phase,
  accentColor,
  direction,
  onDateClick,
  onDateDoubleClick,
  onDateHover,
  savedRanges,
  onSelectRange,
  selectedRangeId,
  nextRangeColor,
  hoveredRange,
}: CalendarGridProps) {
  const monthKey = `${monthData.year}-${monthData.month}`;

  return (
    <div className="flex flex-col gap-1">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((day, i) => (
          <div
            key={day}
            className="text-center text-[10px] md:text-xs font-bold tracking-wider uppercase pb-1"
            style={{
              color: i >= 5 ? accentColor : '#9CA3AF',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          variants={{
            enter:  { rotateX: 90,  opacity: 0, transformOrigin: 'top center' },
            center: { rotateX: 0,   opacity: 1, transformOrigin: 'top center' },
            exit:   { rotateX: -60, opacity: 0, transformOrigin: 'top center' },
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.44, ease: [0.4, 0, 0.2, 1] }}
          style={{ perspective: '600px' }}
        >
          {monthData.weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 mb-0.5">
              {week.map((day, di) => (
                <DateCell
                  key={day.date.toISOString()}
                  day={day}
                  rangeStart={range.start}
                  rangeEnd={range.end}
                  hoverDate={hoverDate}
                  phase={phase}
                  accentColor={accentColor}
                  onDateClick={onDateClick}
                  onDateDoubleClick={onDateDoubleClick}
                  onDateHover={onDateHover}
                  colIndex={di}
                  savedRanges={savedRanges}
                  onSelectRange={onSelectRange}
                  selectedRangeId={selectedRangeId}
                  nextRangeColor={nextRangeColor}
                  hoveredRange={hoveredRange}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
