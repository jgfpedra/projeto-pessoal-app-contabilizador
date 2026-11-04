import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../types';
import { getEventsForDate, getEvents } from '../db/storage';

export function useEventsForDate(dateStr: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setEvents(await getEventsForDate(dateStr));
    setLoading(false);
  }, [dateStr]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [reload]);

  return { events, loading, reload };
}

export function useAllEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setEvents(await getEvents());
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [reload]);

  return { events, loading, reload };
}
