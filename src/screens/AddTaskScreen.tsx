import { useState } from 'react';
import { createTask, updateTask, deleteTask, createDailyItem, deleteDailyItem } from '../db/storage';
import { DailyItem } from '../types';

const TASK_COLORS = ['#C8FF00', '#00E5FF', '#FF6B35', '#FF2D78', '#A855F7', '#34D399', '#FBBF24', '#60A5FA'];
const EMOJIS = ['💪', '🏃', '🧘', '🚴', '🏊', '⚽', '🎯', '📚', '💧', '🥗', '😴', '🧠', '✍️', '🎸', '🎨', '🌿'];

interface Props {
  task?: { id: string; name: string; emoji: string; color: string; type?: 'consistency' | 'daily' };
  onBack: () => void;
}

export default function AddTaskScreen({ task, onBack }: Props) {
  const [name, setName] = useState(task?.name ?? '');
  const [emoji, setEmoji] = useState(task?.emoji ?? '💪');
  const [color, setColor] = useState(task?.color ?? TASK_COLORS[0]);
  const [error, setError] = useState('');
  const [type, setType] = useState<'consistency' | 'daily'>(task?.type ?? 'consistency');
  const [pendingItems, setPendingItems] = useState<string[]>([]); // nomes, antes de salvar
  const [items, setItems] = useState<DailyItem[]>([]);
  const [newItem, setNewItem] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter a name.'); return; }
    if (task) {
      await updateTask(task.id, name.trim(), emoji, color);
      onBack();
    } else {
      const created = await createTask(name.trim(), emoji, color, type);
      for (const itemName of pendingItems) {
        await createDailyItem(created.id, itemName);
      }
      onBack();
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (window.confirm(`Delete "${task.name}" and all its history?`)) {
      await deleteTask(task.id);
      onBack();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', color: 'var(--text)', fontSize: 22, padding: 4 }}>✕</button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{task ? 'Edit task' : 'New task'}</span>
        <button
          onClick={handleSave}
          style={{ background: color, color: '#000', borderRadius: 999, padding: '6px 16px', fontWeight: 700, fontSize: 14 }}
        >Save</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--card)', borderRadius: 12,
          border: `1.5px solid ${color}`, padding: '14px',
        }}>
          <span style={{ fontSize: 28 }}>{emoji}</span>
          <span style={{ fontSize: 20, fontWeight: 700, color, flex: 1 }}>{name || 'Task name'}</span>
        </div>

        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 }}>NAME</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Pull-ups, Meditation, Reading…"
            autoFocus={!task}
            maxLength={40}
            style={{
              background: 'var(--card)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 10, padding: '12px 14px',
              color: 'var(--text)', fontSize: 15,
            }}
          />
          {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
        </div>
        {/* Daily Tasks*/}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 }}>TIPO</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['consistency', 'daily'] as const).map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: type === t ? color + '33' : 'var(--card)',
                border: `1px solid ${type === t ? color : 'var(--border)'}`,
                color: type === t ? color : 'var(--muted)', cursor: 'pointer',
              }}>
                {t === 'consistency' ? '🔥 Consistência' : '📝 Dia a dia'}
              </button>
            ))}
          </div>
        </div>

        {/* Emoji */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 }}>ICON</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: 48, height: 48, borderRadius: 8, fontSize: 22,
                  background: emoji === e ? color + '33' : 'var(--card)',
                  border: `1px solid ${emoji === e ? color : 'var(--border)'}`,
                }}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 }}>COLOR</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TASK_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: c,
                  border: color === c ? '3px solid var(--text)' : '3px solid transparent',
                }}
              />
            ))}
          </div>
        </div>

        {type === 'daily' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 }}>BACKLOG</label>

            {/* modo criação: lista pendingItems */}
            {!task && pendingItems.map((name, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--card)', borderRadius: 10, padding: '10px 12px',
                border: '1px solid var(--border)'
              }}>
                <span style={{ flex: 1, fontSize: 14 }}>{name}</span>
                <button onClick={() => setPendingItems(pendingItems.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>×</button>
              </div>
            ))}

            {/* modo edição: lista items salvos */}
            {task && items.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--card)', borderRadius: 10, padding: '10px 12px',
                border: '1px solid var(--border)'
              }}>
                <span style={{ flex: 1, fontSize: 14 }}>{item.name}</span>
                <button onClick={async () => {
                  await deleteDailyItem(item.id);
                  setItems(items.filter(i => i.id !== item.id));
                }} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>×</button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={async e => {
                  if (e.key !== 'Enter' || !newItem.trim()) return;
                  if (task?.id) {
                    const item = await createDailyItem(task.id, newItem.trim());
                    setItems([...items, item]);
                  } else {
                    setPendingItems([...pendingItems, newItem.trim()]);
                  }
                  setNewItem('');
                }}
                placeholder="Novo item..."
                style={{
                  flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 14
                }} />
              <button onClick={async () => {
                if (!newItem.trim()) return;
                if (task?.id) {
                  const item = await createDailyItem(task.id, newItem.trim());
                  setItems([...items, item]);
                } else {
                  setPendingItems([...pendingItems, newItem.trim()]);
                }
                setNewItem('');
              }} style={{
                padding: '10px 16px', borderRadius: 10, background: color,
                color: '#000', fontWeight: 700, fontSize: 18, border: 'none', cursor: 'pointer'
              }}>+</button>
            </div>
          </div>
        )}

        {task && (
          <button
            onClick={handleDelete}
            style={{
              marginTop: 8, padding: '14px', borderRadius: 10,
              background: 'none', border: '1px solid #FF444444',
              color: 'var(--danger)', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >🗑 Delete task</button>
        )}
      </div>
    </div>
  );
}
