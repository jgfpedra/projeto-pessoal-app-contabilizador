interface Props {
  tracked: boolean;
  trackedType?: 'task' | 'gym';
  onChange: (tracked: boolean, trackedType?: 'task' | 'gym') => void;
}

export default function TrackedSection({ tracked, trackedType, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={labelStyle}>CONTABILIZAR</label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onChange(false, undefined)} style={btn(!tracked)}>Não</button>
        <button onClick={() => onChange(true, trackedType ?? 'task')} style={btn(tracked)}>Sim</button>
      </div>

      {tracked && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onChange(true, 'task')} style={btn(trackedType === 'task')}>📝 Tarefas</button>
          <button onClick={() => onChange(true, 'gym')} style={btn(trackedType === 'gym')}>🏋️ Academia</button>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 };
const btn = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  background: active ? 'var(--accent)' : 'var(--card)',
  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  color: active ? '#000' : 'var(--muted)',
});
