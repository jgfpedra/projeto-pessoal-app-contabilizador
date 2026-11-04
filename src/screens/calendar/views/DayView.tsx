import { CalendarEvent } from '../../../types';
import { formatTime, localDateFromIso, toDateStr } from '../../../utils/dates';

interface Props {
  events: CalendarEvent[];
  dateStr: string;
  onEventPress: (event: CalendarEvent) => void;
}

const HOUR_HEIGHT = 64; // px por hora
const TOTAL_HEIGHT = HOUR_HEIGHT * 24;
const DAY_MS = 24 * 3600000;

function getEventPosition(event: CalendarEvent, dateStr: string) {
  const dayStart = new Date(dateStr + 'T00:00:00').getTime();
  const dayEnd = dayStart + DAY_MS;

  const eventStart = new Date(event.startTime).getTime();
  const eventEnd = new Date(event.endTime).getTime();
  const eventStartDay = new Date(localDateFromIso(event.startTime) + 'T00:00:00').getTime();

  // Recorrências mantêm o horário do dia, mas precisam ser deslocadas para a
  // data que está sendo visualizada. Sem isso, todas caem na meia-noite.
  const shift = event.recurrence.type === 'none' ? 0 : dayStart - eventStartDay;

  const occurrenceStart = eventStart + shift;
  const occurrenceEnd = eventEnd + shift;

  const start = Math.max(occurrenceStart, dayStart);
  const end = Math.min(occurrenceEnd, dayEnd);

  const top = ((start - dayStart) / 3600000) * HOUR_HEIGHT;
  const height = Math.max(((end - start) / 3600000) * HOUR_HEIGHT, 24); // mínimo 24px

  return { top, height, endDateStr: toDateStr(new Date(occurrenceEnd)) };
}

export default function DayView({ events, dateStr, onEventPress }: Props) {
  const now = new Date();
  const todayStr = toDateStr(now);
  const isToday = dateStr === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTop = (currentMinutes / 60) * HOUR_HEIGHT;

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ position: 'relative', height: TOTAL_HEIGHT, display: 'flex' }}>

        {/* hora labels + linhas */}
        <div style={{ width: 48, flexShrink: 0, position: 'relative' }}>
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} style={{
              position: 'absolute', top: hour * HOUR_HEIGHT - 8,
              left: 0, width: '100%',
              fontSize: 10, color: 'var(--muted)', textAlign: 'right',
              paddingRight: 8, fontWeight: 500,
            }}>
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* grid + eventos */}
        <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid var(--border)' }}>
          {/* linhas de hora */}
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} style={{
              position: 'absolute', top: hour * HOUR_HEIGHT,
              left: 0, right: 0, borderTop: '1px solid var(--border)',
            }} />
          ))}

          {/* linha do horário atual */}
          {isToday && (
            <div style={{
              position: 'absolute', top: currentTop,
              left: 0, right: 0, height: 2,
              background: 'var(--accent)', zIndex: 10,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent)', marginTop: -3, marginLeft: -4,
              }} />
            </div>
          )}

          {/* eventos */}
          {events.map(event => {
            const { top, height, endDateStr } = getEventPosition(event, dateStr);
            return (
              <div key={event.id} onClick={() => onEventPress(event)} style={{
                position: 'absolute', top, left: 4, right: 4, height,
                background: event.color + '33',
                border: `1px solid ${event.color}`,
                borderLeft: `3px solid ${event.color}`,
                borderRadius: 6, padding: '3px 6px',
                cursor: 'pointer', overflow: 'hidden', zIndex: 5,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: event.color, lineHeight: 1.2 }}>
                  {event.emoji} {event.title}
                </div>
                {height > 36 && (
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                    {formatTime(event.startTime)} → {formatTime(event.endTime)}
                    {endDateStr !== dateStr && (
                      <span> ({new Date(endDateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
