import { Preferences } from '@capacitor/preferences';
import { CalendarEvent, DayOfWeek } from '../types';
import { toDateStr, localDateFromIso } from '../utils/dates';

const EVENTS_KEY = 'events';

export function today(): string {
  return toDateStr(new Date());
}

async function getAllEvents(): Promise<Record<string, CalendarEvent>> {
  const { value } = await Preferences.get({ key: EVENTS_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllEvents(data: Record<string, CalendarEvent>): Promise<void> {
  await Preferences.set({ key: EVENTS_KEY, value: JSON.stringify(data) });
}

export async function getEvents(): Promise<CalendarEvent[]> {
  const data = await getAllEvents();
  return Object.values(data).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
  const data = await getAllEvents();
  const newEvent: CalendarEvent = {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data[newEvent.id] = newEvent;
  await saveAllEvents(data);
  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>): Promise<void> {
  const data = await getAllEvents();
  if (data[id]) {
    data[id] = { ...data[id], ...updates };
    await saveAllEvents(data);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const data = await getAllEvents();
  delete data[id];
  await saveAllEvents(data);
}

// Retorna todos os eventos que ocorrem numa data específica (considera recorrência)
export function eventOccursOnDate(event: CalendarEvent, dateStr: string): boolean {
  const eventDate = localDateFromIso(event.startTime);
  if (event.recurrence.type === 'none') return eventDate === dateStr;

  if (eventDate > dateStr) return false;

  const target = new Date(dateStr + 'T00:00:00');
  const origin = new Date(eventDate + 'T00:00:00');

  if (event.recurrence.type === 'daily') {
    // verifica se terminou
    if (event.recurrence.ends?.type === 'date') {
      if (dateStr > event.recurrence.ends.endDate) return false;
    }
    if (event.recurrence.ends?.type === 'occurrences') {
      const diffDays = Math.round((target.getTime() - origin.getTime()) / 86400000);
      if (diffDays >= event.recurrence.ends.after) return false;
    }
    return true;
  }

  if (event.recurrence.type === 'custom') {
    const { days = [], everyWeeks = 1, ends } = event.recurrence;
    const targetDay = target.getDay() as DayOfWeek;
    if (!days.includes(targetDay)) return false;

    // verifica semana
    const diffDays = Math.round((target.getTime() - origin.getTime()) / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks % everyWeeks !== 0) return false;

    // verifica fim
    if (ends?.type === 'date' && dateStr > ends.endDate) return false;
    if (ends?.type === 'occurrences') {
      // conta ocorrências até aqui
      let count = 0;
      const cur = new Date(origin);
      while (cur <= target) {
        const d = cur.getDay() as DayOfWeek;
        const w = Math.round((cur.getTime() - origin.getTime()) / (7 * 86400000));
        if (days.includes(d) && w % everyWeeks === 0) count++;
        cur.setDate(cur.getDate() + 1);
      }
      if (count > ends.after) return false;
    }
    return true;
  }

  return false;
}

export async function getEventsForDate(dateStr: string): Promise<CalendarEvent[]> {
  const events = await getEvents();
  return events.filter(e => {
    if (eventOccursOnDate(e, dateStr)) return true;
    const endDate = localDateFromIso(e.endTime);
    const startDate = localDateFromIso(e.startTime);
    return endDate === dateStr && startDate !== dateStr;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
}
