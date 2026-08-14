import { useEffect, useState, useCallback } from 'react';
import { Screen } from '../App';
import {
  getAllTasksWithStats, logTask, decrementLog, today,
  getDailyItemsForTask, getDailyLogForDate,
  setItemSelectedToday, toggleDailyItemDone
} from '../db/storage';
import { DailyItem } from '../types';

type Tab = 'consistency' | 'daily';

interface TaskRow {
  task: { id: string; name: string; emoji: string; color: string; type: string };
  todayCount: number;
  streak: number;
  totalDays: number;
}

interface Props { navigate: (s: Screen) => void; }

interface DailyTaskRow {
  task: { id: string; name: string; emoji: string; color: string; type: string };
  items: DailyItem[];
}

export default function HomeScreen({ navigate }: Props) {
  const [tab, setTab] = useState<Tab>('consistency');
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [dailyRows, setDailyRows] = useState<DailyTaskRow[]>([]);
  const [dailyLog, setDailyLog] = useState<Record<string, boolean>>({});
  const [openTasks, setOpenTasks] = useState<Set<string>>(new Set());

  const dateStr = today();

  const reload = useCallback(async () => {
    const all = await getAllTasksWithStats();
    setTasks(all);
  }, []);

  const reloadDaily = useCallback(async () => {
    const all = await getAllTasksWithStats();
    const rows: DailyTaskRow[] = [];
    for (const r of all.filter(r => r.task.type === 'daily')) {
      const items = await getDailyItemsForTask(r.task.id);
      rows.push({ task: r.task, items });
    }
    setDailyRows(rows);
    setDailyLog(await getDailyLogForDate(dateStr));
  }, [dateStr]);

  useEffect(() => { reload(); reloadDaily(); }, [reload, reloadDaily]);

  useEffect(() => {
    const handler = () => { reload(); reloadDaily(); };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [reload, reloadDaily]);

  const handleLog = async (id: string) => { await logTask(id, dateStr); reload(); };
  const handleDecrement = async (id: string) => { await decrementLog(id, dateStr); reload(); };

  const handleToggleSelected = async (itemId: string, selected: boolean) => {
    await setItemSelectedToday(itemId, dateStr, selected);
    reloadDaily();
  };

  const handleToggleDone = async (itemId: string) => {
    await toggleDailyItemDone(itemId, dateStr);
    reloadDaily();
  };

  const consistencyTasks = tasks.filter(r => r.task.type === 'consistency' || !r.task.type);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header + Tabs */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Today</div>
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
          {(['consistency', 'daily'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 700,
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t ? 'var(--fg)' : 'var(--muted)',
              borderBottom: tab === t ? '2px solid var(--fg)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {t === 'consistency' ? 'Consistência' : 'Dia a dia'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── CONSISTENCY TAB ── */}
        {tab === 'consistency' && (
          consistencyTasks.length === 0 ? (
            <EmptyState />
          ) : consistencyTasks.map(({ task, todayCount, streak, totalDays }) => (
            <div key={task.id} style={cardStyle}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0 }}
                onClick={() => navigate({ name: 'calendar', taskId: task.id, taskName: task.name, taskColor: task.color })}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{task.emoji}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                    {streak > 0 && <span style={streakBadge}>🔥 {streak}d</span>}
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{totalDays} days total</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {todayCount > 0 && (
                  <button onClick={() => handleDecrement(task.id)} style={decrementBtn}>−</button>
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', border: `2px solid ${task.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: todayCount > 0 ? task.color : 'var(--dim)'
                }}>
                  {todayCount}
                </div>
                <button onClick={() => handleLog(task.id)} style={{ ...logBtn, background: task.color }}>+</button>
              </div>
            </div>
          ))
        )}
        {tab === 'daily' && (
          <>
            {/* HOJE — sub-itens selecionados, agrupados por task */}
            {dailyRows.some(r => r.items.some(i => i.id in dailyLog)) && (
              <>
                <SectionLabel>Hoje</SectionLabel>
                {dailyRows.map(({ task, items }) => {
                  const selected = items.filter(i => i.id in dailyLog);
                  if (selected.length === 0) return null;
                  const done = selected.filter(i => dailyLog[i.id]);
                  const notDone = selected.filter(i => !dailyLog[i.id]);
                  const sorted = [...notDone, ...done];
                  return (
                    <div key={task.id}>
                      {/* header da task */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{task.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: task.color }}>{task.name}</span>
                      </div>
                      {sorted.map(item => (
                        <div key={item.id} style={{ ...cardStyle, marginBottom: 6, marginLeft: 8 }}>
                          <button onClick={() => handleToggleDone(item.id)} style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                            border: `2px solid var(--border)`,
                            background: dailyLog[item.id] ? 'var(--fg)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}>
                            {dailyLog[item.id] && <span style={{ color: 'var(--bg)', fontSize: 12 }}>✓</span>}
                          </button>
                          <span style={{
                            flex: 1, fontSize: 14,
                            textDecoration: dailyLog[item.id] ? 'line-through' : 'none',
                            color: dailyLog[item.id] ? 'var(--muted)' : 'var(--fg)'
                          }}>
                            {item.name}
                          </span>
                          <button onClick={() => handleToggleSelected(item.id, false)}
                            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            )}

            {/* BACKLOG — tasks com dropdown */}
            {dailyRows.length > 0 && (
              <>
                <SectionLabel>Backlog</SectionLabel>
                {dailyRows.map(({ task, items }) => {
                  const backlog = items.filter(i => !(i.id in dailyLog));
                  const isOpen = openTasks.has(task.id);
                  return (
                    <div key={task.id} style={{ ...cardStyle, flexDirection: 'column', alignItems: 'stretch', gap: 0, padding: 0, overflow: 'hidden' }}>
                      {/* header clicável */}
                      <button onClick={() => setOpenTasks(prev => {
                        const next = new Set(prev);
                        next.has(task.id) ? next.delete(task.id) : next.add(task.id);
                        return next;
                      })} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 12px',
                        background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left'
                      }}>
                        <span style={{ fontSize: 22 }}>{task.emoji}</span>
                        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{task.name}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{backlog.length} itens</span>
                        <span style={{ color: 'var(--muted)', fontSize: 14, marginLeft: 4 }}>{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {/* sub-itens */}
                      {isOpen && backlog.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                          {backlog.map(item => (
                            <div key={item.id} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 12px', borderBottom: '1px solid var(--border)'
                            }}>
                              <span style={{ flex: 1, fontSize: 14, color: 'var(--fg)' }}>{item.name}</span>
                              <button onClick={() => handleToggleSelected(item.id, true)} style={{
                                padding: '4px 10px', borderRadius: 8, border: `1px solid ${task.color}`,
                                background: 'none', color: task.color, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              }}>+ Hoje</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {isOpen && backlog.length === 0 && (
                        <div style={{
                          padding: '10px 12px', borderTop: '1px solid var(--border)',
                          fontSize: 13, color: 'var(--muted)'
                        }}>Todos os itens estão em Hoje.</div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {dailyRows.length === 0 && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 12, paddingBottom: 80
              }}>
                <div style={{ fontSize: 48 }}>📝</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Nenhuma tarefa diária</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>
                  Toque em + e selecione "Dia a dia".
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 }}>
      <div style={{ fontSize: 48 }}>📋</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>No tasks yet</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>Tap + to add your first habit or training goal.</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', paddingTop: 4 }}>{children}</div>;
}

const cardStyle: React.CSSProperties = {
  background: 'var(--card)', borderRadius: 12,
  border: '1px solid var(--border)', padding: '14px 12px',
  display: 'flex', alignItems: 'center', gap: 12,
};
const streakBadge: React.CSSProperties = {
  background: '#FF6B3520', color: '#FF6B35',
  borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700,
};
const decrementBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: '50%',
  background: 'none', border: '1px solid var(--border)',
  color: 'var(--muted)', fontSize: 18, lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};
const logBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  color: '#000', fontSize: 22, fontWeight: 900, lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', cursor: 'pointer',
};
