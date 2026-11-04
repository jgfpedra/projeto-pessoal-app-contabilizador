import { Recurrence, DayOfWeek } from '../../../types';

interface Props {
  value: Recurrence;
  onChange: (r: Recurrence) => void;
}

const DAY_LABELS: { label: string; value: DayOfWeek }[] = [
  { label: 'D', value: 0 }, { label: 'S', value: 1 }, { label: 'T', value: 2 },
  { label: 'Q', value: 3 }, { label: 'Q', value: 4 }, { label: 'S', value: 5 }, { label: 'S', value: 6 },
];

export default function RecurrenceSection({ value, onChange }: Props) {
  const setType = (type: Recurrence['type']) => {
    if (type === 'none') onChange({ type: 'none' });
    else if (type === 'daily') onChange({ type: 'daily', ends: { type: 'never' } });
    else onChange({ type: 'custom', everyWeeks: 1, days: [], ends: { type: 'never' } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={labelStyle}>REPETIÇÃO</label>

      {/* type selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['none', 'daily', 'custom'] as const).map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: value.type === t ? 'var(--accent)' : 'var(--card)',
            border: `1px solid ${value.type === t ? 'var(--accent)' : 'var(--border)'}`,
            color: value.type === t ? '#000' : 'var(--muted)', cursor: 'pointer',
          }}>
            {t === 'none' ? 'Não repete' : t === 'daily' ? 'Todo dia' : 'Personalizar'}
          </button>
        ))}
      </div>

      {/* custom options */}
      {value.type === 'custom' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px', background: 'var(--card)', borderRadius: 10, border: '1px solid var(--border)' }}>
          {/* every X weeks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>A cada</span>
            <input type="number" min={1} max={12} value={value.everyWeeks ?? 1}
              onChange={e => onChange({ ...value, everyWeeks: Number(e.target.value) })}
              style={{ ...numInput }} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>semana(s)</span>
          </div>

          {/* days of week */}
          <div style={{ display: 'flex', gap: 6 }}>
            {DAY_LABELS.map(({ label, value: dv }) => {
              const active = value.days?.includes(dv);
              return (
                <button key={dv} onClick={() => {
                  const days = value.days ?? [];
                  onChange({ ...value, days: active ? days.filter(d => d !== dv) : [...days, dv] });
                }} style={{
                  width: 36, height: 36, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                  background: active ? 'var(--accent)' : 'var(--card)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  color: active ? '#000' : 'var(--muted)', cursor: 'pointer',
                }}>{label}</button>
              );
            })}
          </div>

          {/* ends */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>TERMINA</span>
            {(['never', 'date', 'occurrences'] as const).map(et => (
              <label key={et} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" checked={value.ends?.type === et}
                  onChange={() => {
                    if (et === 'never') onChange({ ...value, ends: { type: 'never' } });
                    else if (et === 'date') onChange({ ...value, ends: { type: 'date', endDate: '' } });
                    else onChange({ ...value, ends: { type: 'occurrences', after: 10 } });
                  }} />
                {et === 'never' ? 'Nunca' : et === 'date' ? 'Em uma data' : 'Após X ocorrências'}
                {et === 'date' && value.ends?.type === 'date' && (
                  <input type="date" value={value.ends.endDate}
                    onChange={e => onChange({ ...value, ends: { type: 'date', endDate: e.target.value } })}
                    style={{ ...numInput, width: 'auto', flex: 1 }} />
                )}
                {et === 'occurrences' && value.ends?.type === 'occurrences' && (
                  <input type="number" min={1} value={value.ends.after}
                    onChange={e => onChange({ ...value, ends: { type: 'occurrences', after: Number(e.target.value) } })}
                    style={{ ...numInput, width: 60 }} />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* daily ends */}
      {value.type === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px', background: 'var(--card)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>TERMINA</span>
          {(['never', 'date', 'occurrences'] as const).map(et => (
            <label key={et} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="radio" checked={value.ends?.type === et}
                onChange={() => {
                  if (et === 'never') onChange({ ...value, ends: { type: 'never' } });
                  else if (et === 'date') onChange({ ...value, ends: { type: 'date', endDate: '' } });
                  else onChange({ ...value, ends: { type: 'occurrences', after: 10 } });
                }} />
              {et === 'never' ? 'Nunca' : et === 'date' ? 'Em uma data' : 'Após X ocorrências'}
              {et === 'date' && value.ends?.type === 'date' && (
                <input type="date" value={value.ends.endDate}
                  onChange={e => onChange({ ...value, ends: { type: 'date', endDate: e.target.value } })}
                  style={{ ...numInput, width: 'auto', flex: 1 }} />
              )}
              {et === 'occurrences' && value.ends?.type === 'occurrences' && (
                <input type="number" min={1} value={value.ends.after}
                  onChange={e => onChange({ ...value, ends: { type: 'occurrences', after: Number(e.target.value) } })}
                  style={{ ...numInput, width: 60 }} />
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 };
const numInput: React.CSSProperties = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 14, width: 60,
};
