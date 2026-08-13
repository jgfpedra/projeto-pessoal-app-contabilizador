import { useEffect, useState, useCallback } from 'react';
import { getAllTasksWithStats, getWeeklyStats, getMonthlyStats } from '../db/storage';

interface TaskRow {
  task: { id: string; name: string; emoji: string; color: string };
  todayCount: number;
  streak: number;
  totalDays: number;
  totalReps: number;
}

export default function StatsScreen() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [selected, setSelected] = useState(0);
  const [weekly, setWeekly] = useState<{ label: string; count: number }[]>([]);
  const [monthly, setMonthly] = useState<{ label: string; count: number }[]>([]);

  const reload = useCallback(async () => {
    const data = await getAllTasksWithStats();
    setTasks(data);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!tasks[selected]) return;
    const id = tasks[selected].task.id;
    Promise.all([getWeeklyStats(id), getMonthlyStats(id)]).then(([w, m]) => {
      setWeekly(w);
      setMonthly(m);
    });
  }, [tasks, selected]);

  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 48 }}>📊</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>No data yet</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '0 32px' }}>Add tasks and log them to see your stats.</div>
      </div>
    );
  }

  const cur = tasks[selected];
  const color = cur.task.color;
  const maxW = Math.max(...weekly.map(w => w.count), 1);
  const maxM = Math.max(...monthly.map(m => m.count), 1);
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '24px 16px 12px', fontSize: 32, fontWeight: 900 }}>Stats</div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Task selector */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {tasks.map((t, i) => (
            <button
              key={t.task.id}
              onClick={() => setSelected(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, flexShrink: 0,
                background: i === selected ? t.task.color : 'var(--card)',
                border: `1px solid ${i === selected ? t.task.color : 'var(--border)'}`,
                color: i === selected ? '#000' : 'var(--text)',
                fontSize: 13, fontWeight: i === selected ? 700 : 400,
              }}
            >
              <span>{t.task.emoji}</span> {t.task.name}
            </button>
          ))}
        </div>

        {/* Summary grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { value: cur.streak, label: 'day streak 🔥' },
            { value: cur.totalDays, label: 'active days' },
            { value: cur.totalReps, label: 'total reps' },
            { value: 0, label: 'best day' },
          ].map(({ value, label }, i) => (
            <div key={i} style={{
              background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)',
              padding: '16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, fontWeight: 900, color, lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Weekly chart */}
        <BarChart title="Last 7 days" data={weekly} max={maxW} color={color} />

        {/* Monthly chart */}
        <BarChart title={`${monthName} by week`} data={monthly} max={maxM} color={color} />
      </div>
    </div>
  );
}

function BarChart({ title, data, max, color }: { title: string; data: { label: string; count: number }[]; max: number; color: string }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
        {data.map((d, i) => {
          const pct = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              {d.count > 0 && <span style={{ fontSize: 9, color: 'var(--muted)' }}>{d.count}</span>}
              <div style={{
                width: '100%', borderRadius: 4,
                background: d.count > 0 ? color : 'var(--border)',
                height: `${Math.max(pct, d.count > 0 ? 6 : 2)}%`,
                opacity: 0.85,
              }} />
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
