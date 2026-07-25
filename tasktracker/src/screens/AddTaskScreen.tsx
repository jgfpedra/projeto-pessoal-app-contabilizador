import React, { useState } from 'react';
import { createTask, updateTask, deleteTask } from '../db/storage';

const TASK_COLORS = ['#C8FF00', '#00E5FF', '#FF6B35', '#FF2D78', '#A855F7', '#34D399', '#FBBF24', '#60A5FA'];
const EMOJIS = ['💪', '🏃', '🧘', '🚴', '🏊', '⚽', '🎯', '📚', '💧', '🥗', '😴', '🧠', '✍️', '🎸', '🎨', '🌿'];

interface Props {
  task?: { id: string; name: string; emoji: string; color: string };
  onBack: () => void;
}

export default function AddTaskScreen({ task, onBack }: Props) {
  const [name, setName] = useState(task?.name ?? '');
  const [emoji, setEmoji] = useState(task?.emoji ?? '💪');
  const [color, setColor] = useState(task?.color ?? TASK_COLORS[0]);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter a name.'); return; }
    if (task) {
      await updateTask(task.id, name.trim(), emoji, color);
    } else {
      await createTask(name.trim(), emoji, color);
    }
    onBack();
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
