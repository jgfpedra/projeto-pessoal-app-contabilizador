import { useState } from 'react';
import { Screen } from '../../App';
import { CalendarEvent } from '../../types';
import { useEventsForDate, useAllEvents } from '../../hooks/useEvents';
import { today, startOfWeek, addDays } from '../../utils/dates';
import DayView from './views/DayView';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';

type ViewMode = 'day' | 'week' | 'month';

interface Props {
  navigate: (s: Screen) => void;
}

export default function CalendarScreen({ navigate }: Props) {
  const [mode, setMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(today());
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { events: dayEvents } = useEventsForDate(selectedDate);
  const { events: allEvents } = useAllEvents();

  const weekStart = startOfWeek(selectedDate);

  const handleEventPress = (event: CalendarEvent) => {
    navigate({ name: 'addEvent', event });
  };

  const handleDayPress = (dateStr: string) => {
    setSelectedDate(dateStr);
    setMode('day');
  };

  const navigate_date = (dir: 1 | -1) => {
    if (mode === 'day') {
      setSelectedDate(addDays(selectedDate, dir));
    } else if (mode === 'week') {
      setSelectedDate(addDays(selectedDate, dir * 7));
    } else {
      const d = new Date(year, month - 1 + dir, 1);
      setYear(d.getFullYear());
      setMonth(d.getMonth() + 1);
    }
  };

  const headerLabel = () => {
    if (mode === 'day') {
      return new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    }
    if (mode === 'week') {
      const end = addDays(weekStart, 6);
      return `${new Date(weekStart + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${new Date(end + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
    }
    return new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 8px' }}>
        <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Calendário</div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--card)', borderRadius: 10, padding: 4, marginBottom: 12 }}>
          {(['day', 'week', 'month'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setMode(v)} style={{
              flex: 1, padding: '6px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: mode === v ? 'var(--accent)' : 'none',
              border: 'none', color: mode === v ? '#000' : 'var(--muted)', cursor: 'pointer',
            }}>
              {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>

        {/* Date nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate_date(-1)}
            style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text)', cursor: 'pointer' }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{headerLabel()}</span>
          <button onClick={() => navigate_date(1)}
            style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text)', cursor: 'pointer' }}>›</button>
        </div>
      </div>

      {/* View */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {mode === 'day' && <DayView events={dayEvents} dateStr={selectedDate} onEventPress={handleEventPress} />}
        {mode === 'week' && <WeekView weekStart={weekStart} allEvents={allEvents} onDayPress={handleDayPress} />}
        {mode === 'month' && <MonthView year={year} month={month} allEvents={allEvents} onDayPress={handleDayPress} />}
      </div>
    </div>
  );
}
