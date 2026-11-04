import { useState } from 'react';
import { createEvent, updateEvent, deleteEvent } from '../../db/storage';
import { CalendarEvent, Recurrence } from '../../types';
import { addMinutes } from '../../utils/dates';
import TimeSection from './sections/TimeSection';
import RecurrenceSection from './sections/RecurrenceSection';
import TrackedSection from './sections/TrackedSection';

const COLORS = ['#C8FF00', '#00E5FF', '#FF6B35', '#FF2D78', '#A855F7', '#34D399', '#FBBF24', '#60A5FA'];
const EMOJIS = ['📝', '🏋️', '🧘', '🚴', '🏊', '⚽', '🎯', '📚', '💧', '🥗', '😴', '🧠', '✍️', '🎸', '🎨', '🌿'];

interface Props {
  event?: CalendarEvent;
  onBack: () => void;
}

function defaultStart(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString();
}

export default function AddEventScreen({ event, onBack }: Props) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [emoji, setEmoji] = useState(event?.emoji ?? '📝');
  const [color, setColor] = useState(event?.color ?? COLORS[0]);
  const [description, setDescription] = useState(event?.description ?? '');
  const [startTime, setStartTime] = useState(event?.startTime ?? defaultStart());
  const [endTime, setEndTime] = useState(event?.endTime ?? addMinutes(defaultStart(), 60));
  const [recurrence, setRecurrence] = useState<Recurrence>(event?.recurrence ?? { type: 'none' });
  const [tracked, setTracked] = useState(event?.tracked ?? false);
  const [trackedType, setTrackedType] = useState(event?.trackedType);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) { setError('Insira um título.'); return; }
    const payload = { title: title.trim(), emoji, color, description, startTime, endTime, recurrence, tracked, trackedType };
    if (event) {
      await updateEvent(event.id, payload);
    } else {
      await createEvent(payload);
    }
    onBack();
  };

  const handleDelete = async () => {
    if (!event) return;
    if (window.confirm(`Deletar "${event.title}"?`)) {
      await deleteEvent(event.id);
      onBack();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', color: 'var(--text)', fontSize: 22, padding: 4 }}>✕</button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{event ? 'Editar evento' : 'Novo evento'}</span>
        <button onClick={handleSave}
          style={{ background: color, color: '#000', borderRadius: 999, padding: '6px 16px', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          Salvar
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', borderRadius: 12, border: `1.5px solid ${color}`, padding: '14px' }}>
          <span style={{ fontSize: 28 }}>{emoji}</span>
          <span style={{ fontSize: 20, fontWeight: 700, color, flex: 1 }}>{title || 'Nome do evento'}</span>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>TÍTULO</label>
          <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }}
            placeholder="ex: Treino, Reunião, Leitura..."
            autoFocus={!event} maxLength={40}
            style={{ background: 'var(--card)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 15 }} />
          {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>DESCRIÇÃO</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Observações..." rows={3}
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, resize: 'none' }} />
        </div>

        <TimeSection startTime={startTime} endTime={endTime}
          onChange={(s, e) => { setStartTime(s); setEndTime(e); }} />

        <RecurrenceSection value={recurrence} onChange={setRecurrence} />

        <TrackedSection tracked={tracked} trackedType={trackedType}
          onChange={(t, tt) => { setTracked(t); setTrackedType(tt); }} />

        {/* Emoji */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>ÍCONE</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 48, height: 48, borderRadius: 8, fontSize: 22,
                background: emoji === e ? color + '33' : 'var(--card)',
                border: `1px solid ${emoji === e ? color : 'var(--border)'}`,
                cursor: 'pointer',
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>COR</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 36, height: 36, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                outline: color === c ? '3px solid var(--text)' : '3px solid transparent', outlineOffset: 2,
              }} />
            ))}
          </div>
        </div>

        {event && (
          <button onClick={handleDelete} style={{
            marginTop: 8, padding: '14px', borderRadius: 10,
            background: 'none', border: '1px solid #FF444444',
            color: 'var(--danger)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>🗑 Deletar evento</button>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 };
