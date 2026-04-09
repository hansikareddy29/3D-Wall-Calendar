'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X
} from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import { usePageFlipSound } from '@/hooks/usePageFlipSound';
import { generateMonthData, isSameDay, MONTH_NAMES } from '@/utils/dateHelpers';
import { MONTH_HERO_IMAGES } from '@/utils/heroImages';
import WallHanger from './WallHanger';
import HeroImage from './HeroImage';
import CalendarGrid from './CalendarGrid';
import NavControls from './NavControls';
import FullListPanel from './FullListPanel';
import { useRangeNotes } from '@/hooks/useRangeNotes';
import { getDayDateKey } from '@/utils/dateHelpers';
import { RANGE_COLORS } from '@/utils/colors';
import { QUOTES } from '@/utils/quotes';
import { CATEGORIES } from '@/utils/categories';

// ── Minimal stacked pages behind main card ──
const STACKED_PAGES = [
  { rotate: -1.8, ty: 5, tx: -5, opacity: 0.82 },
  { rotate: 1.5, ty: 9, tx: 4, opacity: 0.60 },
];

// ── Flip animation for the entire card ──
const cardFlipVariants = {
  enter: (direction: number) => ({
    rotateX: direction > 0 ? 25 : -100,
    opacity: 0,
    z: direction > 0 ? -20 : 50,
    zIndex: direction > 0 ? 5 : 20,
    transformOrigin: 'top center',
  }),
  center: {
    rotateX: 0,
    opacity: 1,
    z: 0,
    zIndex: 10,
    transformOrigin: 'top center',
    transition: {
      rotateX: { type: 'spring', stiffness: 100, damping: 20 } as const,
      opacity: { duration: 0.3 }
    }
  },
  exit: (direction: number) => ({
    rotateX: direction > 0 ? -160 : 30,
    opacity: 0,
    z: direction > 0 ? 60 : -40,
    zIndex: direction > 0 ? 30 : 5,
    transformOrigin: 'top center',
    transition: {
      rotateX: { type: 'spring', stiffness: 90, damping: 22 } as const,
      opacity: { duration: 0.3 }
    }
  }),
};

export default function WallCalendar() {
  // Preload all hero images on mount so flipping months is instant in production
  useEffect(() => {
    if (typeof window !== 'undefined') {
      MONTH_HERO_IMAGES.forEach((data) => {
        const img = new Image();
        img.src = data.url;
      });
    }
  }, []);
  const {
    currentYear,
    currentMonth,
    range,
    hoverDate,
    phase,
    goToPrevMonth,
    goToNextMonth,
    setMonthView,
    handleDateClick,
    handleDateHover,
    clearRange,
  } = useCalendar();

  const { playFlip } = usePageFlipSound();

  const { savedRanges, addRange, updateRangeNote, deleteRange, toggleRangeComplete, toggleRangeCategory } = useRangeNotes();
  const [selectedRangeId, setSelectedRangeId] = useState<string | null>(null);
  const [hoveredRangeId, setHoveredRangeId] = useState<string | null>(null);

  // Derived: the actual range object being hovered
  const hoveredRange = useMemo(() => {
    return savedRanges.find(r => r.id === hoveredRangeId) || null;
  }, [savedRanges, hoveredRangeId]);

  const nextRangeColor = RANGE_COLORS[savedRanges.length % RANGE_COLORS.length];

  const [direction, setDirection] = useState(1);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Navigation: Track direction for flip animation
  const kick = (dir: number) => {
    playFlip();
    setDirection(dir);
    if (dateInputRef.current) {
      dateInputRef.current.value = '';
    }
    if (dir > 0) goToNextMonth(); else goToPrevMonth();
  };

  const heroData = MONTH_HERO_IMAGES[currentMonth];
  const accentColor = heroData.accentColor;

  const monthData = useMemo(
    () => generateMonthData(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // Simplified navigation (removed swing)
  const monthKey = `${currentYear}-${currentMonth}`;

  // 1. Calculate boundaries of the viewed month as Dates
  const viewStart = useMemo(() => new Date(currentYear, currentMonth, 1), [currentYear, currentMonth]);
  const viewEnd = useMemo(() => new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999), [currentYear, currentMonth]);

  // 2. Check if the active selection (range) overlaps with the current view
  const isSelectionInView = useMemo(() => {
    if (!range.start) return false;

    // If selecting, we always want to show the hint/partial chip to guide the user
    if (phase === 'selecting') return true;

    // If settled, use standard overlap: range.start <= viewEnd && range.end >= viewStart
    if (range.start && range.end) {
      const [s, e] = range.start <= range.end ? [range.start, range.end] : [range.end, range.start];
      return s <= viewEnd && e >= viewStart;
    }

    return false;
  }, [range, phase, viewStart, viewEnd]);

  // Range display string
  const rangeDisplay = (() => {
    if (!range.start || !isSelectionInView) return null;
    if (!range.end || isSameDay(range.start, range.end)) {
      return range.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    const s = range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = range.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const days = Math.round((range.end.getTime() - range.start.getTime()) / 86400000) + 1;
    return `${s} – ${e} (${days}d)`;
  })();

  const currentQuote = useMemo(() => {
    const idx = (currentYear * 12 + currentMonth) % QUOTES.length;
    return QUOTES[idx];
  }, [currentYear, currentMonth]);
  const todayKey = useMemo(() => getDayDateKey(new Date()), []);
  const todayItems = useMemo(() => {
    return savedRanges.filter(r => r.start <= todayKey && r.end >= todayKey);
  }, [savedRanges, todayKey]);

  const wallBg = 'radial-gradient(ellipse at 55% 15%, #efebe5 0%, #ddd8cf 100%)';
  const cardBg = '#ffffff';
  const borderC = 'rgba(0,0,0,0.06)';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-500"
      style={{ background: wallBg }}
    >
      {/* Wall texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'multiply',
        }}
      />

      {/* ── Pendulum pivot at nail top center ── */}
      {/* ── Main Assembly Container ── */}
      <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 overflow-y-auto pt-40 pb-20">
        <style>{`
          @keyframes pendulumSwing {
            from { transform: rotate(0.75deg); }
            to { transform: rotate(-0.75deg); }
          }
        `}</style>
        {/* ── Card stack (The primary element centered by Flexbox) ── */}
        <div
          className="relative grid"
          style={{
            width: 'min(800px, 94vw)',
            paddingBottom: '14px',
            perspective: '1500px',
            zIndex: 10,
            transformOrigin: '50% calc(min(800px, 94vw) * -112 / 800)',
            animation: 'pendulumSwing 3s ease-in-out infinite alternate'
          }}
        >
          {/* WallHanger (Detached from flow, attached to card top) */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none" 
            style={{ 
              width: '100%', 
              top: 'calc(min(800px, 94vw) * -126 / 800)', // Align clips' jaws securely with card top
              zIndex: 100 
            }}
          >
            <WallHanger />
          </div>
            <AnimatePresence initial={false} custom={direction}>
              {/* Wrapped Stacked pages for the main landscape card */}
              <div key={monthKey + "_stack"} className="absolute inset-0 z-0">
                {STACKED_PAGES.map((pg, i) => (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{
                      transform: `rotate(${pg.rotate}deg) translateY(${pg.ty}px) translateX(${pg.tx}px)`,
                      transformOrigin: 'top center',
                      backgroundColor: '#f8f6f3',
                      borderRadius: '10px',
                      opacity: pg.opacity,
                      zIndex: 2 - i,
                      boxShadow: '0 3px 14px rgba(0,0,0,0.10)',
                    }}
                  />
                ))}
              </div>

              {/* ── Main landscape card ── */}
              <motion.div
                key={monthKey}
                custom={direction}
                variants={cardFlipVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  gridArea: '1 / 1',
                  width: '100%',
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: cardBg,
                  backfaceVisibility: 'hidden',
                  boxShadow: '0 20px 55px rgba(0,0,0,0.20), 0 6px 20px rgba(0,0,0,0.10)',
                  zIndex: 10,
                }}
              >
                {/* ── Top strip ── */}
                <div
                  style={{
                    height: '8px',
                    background: 'linear-gradient(180deg, #f2efe8, #ffffff)',
                    borderBottom: `1px solid ${borderC}`,
                  }}
                />

                <div className="flex flex-col sm:flex-row" style={{ minHeight: '420px' }}>
                  <div className="relative flex-shrink-0 h-56 sm:h-auto sm:w-[42%] overflow-hidden">
                    <HeroImage
                      year={currentYear}
                      month={currentMonth}
                      heroData={heroData}
                      direction={direction}
                    />
                    <FullListPanel
                      savedRanges={savedRanges}
                      accentColor={accentColor}
                      currentYear={currentYear}
                      currentMonth={currentMonth}
                      onDeleteRange={deleteRange}
                      onToggleComplete={toggleRangeComplete}
                      onUpdateNote={updateRangeNote}
                      onToggleCategory={toggleRangeCategory}
                      onHoverRange={setHoveredRangeId}
                      onClearRange={clearRange}
                      onSelectRange={setSelectedRangeId}
                      selectedRangeId={selectedRangeId}
                    />
                  </div>

                  <div
                    className="flex-1 flex flex-col px-5 pt-0 sm:pt-4 pb-4 calendar-content-panel"
                    style={{ borderTop: 'none', borderLeft: 'none', minWidth: 0 }}
                  >
                    <style jsx>{`
                      .calendar-content-panel {
                        border-top: none;
                        border-left: none;
                      }
                      @media (min-width: 640px) {
                        .calendar-content-panel {
                          border-left: 1px solid ${borderC} !important;
                        }
                      }
                    `}</style>
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h1 className="font-black leading-none" style={{ fontSize: 'clamp(28px, 5cqw, 42px)', color: accentColor }}>
                            {MONTH_NAMES[currentMonth]}
                          </h1>
                          <p className="tracking-[0.18em] mt-0.5" style={{ fontSize: '11px', color: accentColor, fontWeight: 600 }}>
                            {currentYear}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 bg-white/50 p-1 pl-2 pr-1 rounded-full border border-gray-100 shadow-sm backdrop-blur-sm">
                          <NavControls onPrev={() => kick(-1)} onNext={() => kick(1)} accentColor={accentColor} />

                          <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />
                          
                          <input
                            ref={dateInputRef}
                            type="date"
                            title="Jump to date"
                            className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 cursor-pointer w-[120px] pl-1 pr-2 py-0 focus:ring-0 uppercase"
                            style={{ color: accentColor }}
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const [y, m, d] = e.target.value.split('-').map(Number);
                              
                              // Chrome aggressively formats partial year typing.
                              // To avoid wild calendar jumps while typing (like "2" evaluating to 1902 or 0002),
                              // we wait until the year is in a reasonable modern 4-digit era to trigger the jump.
                              if (y < 1970 || y > 2100) return;
                              
                              const targetDate = new Date(y, m - 1, d);
                              if (targetDate.getMonth() !== currentMonth || targetDate.getFullYear() !== currentYear) {
                                playFlip();
                                setDirection(
                                  targetDate.getFullYear() > currentYear || (targetDate.getFullYear() === currentYear && targetDate.getMonth() > currentMonth) ? 1 : -1
                                );
                                setMonthView(targetDate.getFullYear(), targetDate.getMonth());
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-4 h-5">
                        <AnimatePresence mode="wait">
                          {rangeDisplay && (
                            <motion.div
                              key="chip"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: accentColor }}
                            >
                              <span className="opacity-90 tracking-wide">{rangeDisplay}</span>
                              <button onClick={clearRange} className="hover:opacity-70">
                                <X size={10} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <CalendarGrid
                        monthData={monthData}
                        range={range}
                        hoverDate={hoverDate}
                        phase={phase}
                        accentColor={accentColor}
                        direction={direction}
                        onDateClick={(date) => {
                          if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
                            playFlip();
                            setMonthView(date.getFullYear(), date.getMonth());
                          }
                          const dateKey = getDayDateKey(date);
                          const rangesOnDate = savedRanges.filter(r => r.start === dateKey || r.end === dateKey);
                          if (phase === 'idle' && rangesOnDate.length > 0) {
                            const currentIdx = rangesOnDate.findIndex(r => r.id === selectedRangeId);
                            const nextIdx = (currentIdx + 1) % rangesOnDate.length;
                            setSelectedRangeId(rangesOnDate[nextIdx].id);
                          }
                          handleDateClick(date, (s, e) => {
                            const newId = addRange(s, e);
                            setSelectedRangeId(newId);
                          });
                        }}
                        onDateDoubleClick={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return;
                          if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
                            playFlip();
                            setMonthView(date.getFullYear(), date.getMonth());
                          }
                          const newId = addRange(date, date);
                          setSelectedRangeId(newId);
                          clearRange();
                        }}
                        onDateHover={handleDateHover}
                        savedRanges={savedRanges}
                        onSelectRange={setSelectedRangeId}
                        selectedRangeId={selectedRangeId}
                        nextRangeColor={nextRangeColor}
                        hoveredRange={hoveredRange}
                      />

                      <div
                        className="mt-3 pt-2 flex flex-col h-[220px]"
                        style={{ borderTop: `1px solid ${borderC}` }}
                        aria-hidden="true"
                      >
                        {/* Schedule for Today */}
                        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                          {todayItems.length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-red-400" />
                                Today&apos;s Schedule
                              </h3>
                              <div className="space-y-2">
                                {todayItems.map(item => (
                                  <div
                                    key={item.id}
                                    className="flex items-start gap-2 group cursor-pointer transition-opacity"
                                    onMouseEnter={() => setHoveredRangeId(item.id)}
                                    onMouseLeave={() => setHoveredRangeId(null)}
                                  >
                                    <div className="w-0.5 h-3 mt-1 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 flex-1 min-w-0">
                                      <p className={`text-[11px] leading-tight font-bold text-slate-700 flex items-center flex-wrap gap-1.5 ${item.completed ? 'opacity-50' : ''}`}>
                                        <span className={item.completed ? 'line-through' : ''}>
                                          {item.note || 'Untitled'}
                                        </span>
                                        {item.completed && (
                                          <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-[8px] font-black rounded uppercase tracking-tighter border border-green-200 inline-block">
                                            Done
                                          </span>
                                        )}
                                        {item.end === todayKey && !item.completed && (
                                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-black rounded uppercase tracking-tighter border border-red-200 inline-block">
                                            Deadline
                                          </span>
                                        )}
                                      </p>

                                      {item.categories && item.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {item.categories.map(catId => {
                                            const cat = CATEGORIES.find(c => c.id === catId);
                                            return cat ? (
                                              <span
                                                key={catId}
                                                className="px-1 py-0.5 bg-white text-[7px] font-black rounded uppercase tracking-tighter border shadow-sm inline-block"
                                                style={{ color: cat.color, borderColor: 'rgba(0,0,0,0.05)' }}
                                              >
                                                {cat.label}
                                              </span>
                                            ) : null;
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Spacer to maintain vertical dimensions as requested */}
                        <div className="text-center px-4 pb-4">
                          <p className="text-[11px] text-slate-500 italic leading-relaxed font-medium">
                            &ldquo;{currentQuote}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Ground shadow for the main card */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '6%',
              width: '88%',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.12)',
              filter: 'blur(10px)',
              zIndex: 0,
            }} />
          </div>
      </div>
    </div>
  );
}
