import { CalendarEvent } from '../../../types';
import { addDays, toDateStr } from '../../../utils/dates';
import { eventOccursOnDate } from '../../../db/storage';

interface Props {
  weekStart: string;
  allEvents: CalendarEvent[];
  onDayPress: (dateStr: string) => void;
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function WeekView({ weekStart, allEvents, onDayPress }: Props) {
  const todayStr = toDateStr(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div style={{ display: 'flex', flex: 1, overflowY: 'auto' }}>
      {days.map((dateStr, i) => {
        const dayEvents = allEvents.filter(e => eventOccursOnDate(e, dateStr));
        const isToday = dateStr === todayStr;
        return (
          <div key={dateStr} onClick={() => onDayPress(dateStr)}
            style={{ flex: 1, borderRight: '1px solid var(--border)', cursor: 'pointer',
              background: isToday ? 'var(--card)' : 'none' }}>
            {/* header */}
            <div style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{DAY_LABELS[i]}</div>
              <div style={{ fontSize: 16, fontWeight: isToday ? 900 : 400,
                color: isToday ? 'var(--accent)' : 'var(--text)' }}>
                {Number(dateStr.split('-')[2])}
              </div>
            </div>
            {/* events */}
            <div style={{ padding: '4px 2px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {dayEvents.slice(0, 3).map(event => (
                <div key={event.id} style={{
                  background: event.color, borderRadius: 3,
                  padding: '2px 4px', fontSize: 9, fontWeight: 600, color: '#000',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{event.emoji} {event.title}</div>
              ))}
              {dayEvents.length > 3 && (
                <div style={{ fontSize: 9, color: 'var(--muted)', paddingLeft: 4 }}>
                  +{dayEvents.length - 3}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
