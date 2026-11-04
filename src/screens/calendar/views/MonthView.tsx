import { CalendarEvent } from '../../../types';
import { toDateStr, daysInMonth } from '../../../utils/dates';
import { eventOccursOnDate } from '../../../db/storage';

interface Props {
  year: number;
  month: number; // 1-12
  allEvents: CalendarEvent[];
  onDayPress: (dateStr: string) => void;
}

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function MonthView({ year, month, allEvents, onDayPress }: Props) {
  const todayStr = toDateStr(new Date());
  const total = daysInMonth(year, month);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
      {/* day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = allEvents.filter(e => eventOccursOnDate(e, dateStr));
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr} onClick={() => onDayPress(dateStr)} style={{
              aspectRatio: '1', borderRadius: 8, cursor: 'pointer',
              border: isToday ? `2px solid var(--accent)` : '1px solid var(--border)',
              background: 'var(--card)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '4px 2px', gap: 2,
            }}>
              <span style={{ fontSize: 12, fontWeight: isToday ? 900 : 400,
                color: isToday ? 'var(--accent)' : 'var(--text)' }}>{day}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                {dayEvents.slice(0, 3).map(e => (
                  <div key={e.id} style={{ width: 6, height: 6, borderRadius: '50%', background: e.color }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
