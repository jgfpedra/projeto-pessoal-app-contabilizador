import React, { useEffect, useState, useCallback } from 'react';
import { Screen } from '../App';
import { getAllTasksWithStats, logTask, decrementLog, today } from '../db/storage';

interface TaskRow {
  task: { id: string; name: string; emoji: string; color: string };
  todayCount: number;
  streak: number;
  totalDays: number;
}

interface Props {
  navigate: (s: Screen) => void;
}

export default function HomeScreen({ navigate }: Props) {
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const reload = useCallback(async () => {
    setTasks(await getAllTasksWithStats());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // re-load when screen gets focus (back from add/edit)
  useEffect(() => {
    const handler = () => reload();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [reload]);

  const handleLog = async (id: string) => {
    await logTask(id, today());
    reload();
  };

  const handleDecrement = async (id: string) => {
    await decrementLog(id, today());
    reload();
  };

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '24px 16px 12px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 0.5 }}>{dateLabel}</div>
        <div style={{ fontSize: 32, fontWeight: 900, marginTop: 2 }}>Today</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>No tasks yet</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>Tap + to add your first habit or training goal.</div>
          </div>
        ) : tasks.map(({ task, todayCount, streak, totalDays }) => (
          <div key={task.id}
            style={{
              background: 'var(--card)', borderRadius: 12,
              border: '1px solid var(--border)', padding: '14px 12px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            {/* Left: info */}
            <div
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0 }}
              onClick={() => navigate({ name: 'calendar', taskId: task.id, taskName: task.name, taskColor: task.color })}
            >
              <span style={{ fontSize: 26, flexShrink: 0 }}>{task.emoji}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {task.name}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                  {streak > 0 && (
                    <span style={{
                      background: '#FF6B3520', color: '#FF6B35',
                      borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700,
                    }}>🔥 {streak}d</span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{totalDays} days total</span>
                </div>
              </div>
            </div>

            {/* Right: counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {todayCount > 0 && (
                <button
                  onClick={() => handleDecrement(task.id)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'none', border: '1px solid var(--border)',
                    color: 'var(--muted)', fontSize: 18, lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >−</button>
              )}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `2px solid ${task.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700,
                color: todayCount > 0 ? task.color : 'var(--dim)',
              }}>{todayCount}</div>
              <button
                onClick={() => handleLog(task.id)}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: task.color, color: '#000',
                  fontSize: 22, fontWeight: 900, lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
