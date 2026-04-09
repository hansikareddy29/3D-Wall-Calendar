export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface MonthData {
  year: number;
  month: number; // 0-indexed
  weeks: CalendarDay[][];
}

export type SelectionPhase = 'idle' | 'selecting'; // idle = no start, selecting = has start

export interface SavedRange {
  id: string;
  start: string; 
  end: string;
  color: string;
  note: string;
  completed?: boolean;
  categories?: string[];
}

export interface CalendarState {
  currentYear: number;
  currentMonth: number;
  range: DateRange;
  hoverDate: Date | null;
  phase: SelectionPhase;
}
