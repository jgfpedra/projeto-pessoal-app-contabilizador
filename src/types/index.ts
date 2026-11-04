export type RecurrenceEnd =
  | { type: 'never' }
  | { type: 'date'; endDate: string }
  | { type: 'occurrences'; after: number };

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom

export interface Recurrence {
  type: 'none' | 'daily' | 'custom';
  everyWeeks?: number;
  days?: DayOfWeek[];
  ends?: RecurrenceEnd;
}

export interface CalendarEvent {
  id: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
  recurrence: Recurrence;
  tracked: boolean;
  trackedType?: 'task' | 'gym';
  createdAt: string;
}
