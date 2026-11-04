import { Screen } from '../../App';
import { CalendarEvent } from '../../types';
import { useEventsForDate } from '../../hooks/useEvents';
import { today, formatTime } from '../../utils/dates';

interface Props {
  navigate: (s: Screen) => void;
}

export default function HomeScreen({ navigate }: Props) {
  const dateStr = today();
  const { events, loading } = useEventsForDate(dateStr);

  if (loading) return <LoadingState />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '24px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 32, fontWeight: 900 }}>Hoje</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          events.map(event => (
            <EventCard key={event.id} event={event}
              onPress={() => navigate({ name: 'addEvent', event })} />
          ))
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onPress }: { event: CalendarEvent; onPress: () => void }) {
  return (
    <div onClick={onPress} style={{
      background: 'var(--card)', borderRadius: 12,
      border: `1px solid var(--border)`,
      borderLeft: `4px solid ${event.color}`,
      padding: '12px 14px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{event.emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{event.title}</span>
        {event.tracked && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: event.color,
            background: event.color + '22', borderRadius: 999, padding: '2px 8px'
          }}>
            {event.trackedType === 'gym' ? '🏋️' : '📝'}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
        {formatTime(event.startTime)} → {formatTime(event.endTime)}
      </div>
      {event.description ? (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{event.description}</div>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, paddingBottom: 80
    }}>
      <div style={{ fontSize: 48 }}>📋</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>Nenhum evento hoje</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>
        Toque em + para adicionar.
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando...</div>
    </div>
  );
}
