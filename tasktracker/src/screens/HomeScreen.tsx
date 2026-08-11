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

export default function HomeScreen({ navigate }: Props) {
  const [tab, setTab] = useState<Tab>('consistency');
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [dailyItems, setDailyItems] = useState<DailyItem[]>([]);
  const [dailyLog, setDailyLog] = useState<Record<string, boolean>>({});

  const dateStr = today();

  const reload = useCallback(async () => {
    const all = await getAllTasksWithStats();
    setTasks(all);
  }, []);

  const reloadDaily = useCallback(async () => {
    // Pega todos os daily tasks e agrega seus itens
    const all = await getAllTasksWithStats();
    const dailyTasks = all.filter(r => r.task.type === 'daily');
    const items: DailyItem[] = [];
    for (const r of dailyTasks) {
      const its = await getDailyItemsForTask(r.task.id);
      items.push(...its);
    }
    setDailyItems(items);
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
  const selectedItems = dailyItems.filter(i => i.id in dailyLog);
  const backlogItems = dailyItems.filter(i => !(i.id in dailyLog));

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

        {/* ── DAILY TAB ── */}
        {tab === 'daily' && (
          <>
            {/* Itens selecionados para hoje */}
            {selectedItems.length > 0 && (
              <>
                <SectionLabel>Hoje</SectionLabel>
                {selectedItems.map(item => (
                  <div key={item.id} style={{ ...cardStyle, gap: 10 }}>
                    <button onClick={() => handleToggleDone(item.id)} style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      border: `2px solid var(--border)`, background: dailyLog[item.id] ? 'var(--fg)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {dailyLog[item.id] && <span style={{ color: 'var(--bg)', fontSize: 14 }}>✓</span>}
                    </button>
                    <span style={{
                      flex: 1, fontSize: 15, fontWeight: 500,
                      textDecoration: dailyLog[item.id] ? 'line-through' : 'none',
                      color: dailyLog[item.id] ? 'var(--muted)' : 'var(--fg)'
                    }}>
                      {item.name}
                    </span>
                    <button onClick={() => handleToggleSelected(item.id, false)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>
                      ×
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* Backlog */}
            {backlogItems.length > 0 && (
              <>
                <SectionLabel>Backlog</SectionLabel>
                {backlogItems.map(item => (
                  <div key={item.id} style={{ ...cardStyle, opacity: 0.7 }}>
                    <span style={{ flex: 1, fontSize: 15 }}>{item.name}</span>
                    <button onClick={() => handleToggleSelected(item.id, true)} style={{
                      padding: '4px 12px', borderRadius: 8, border: '1px solid var(--border)',
                      background: 'none', color: 'var(--fg)', fontSize: 13, cursor: 'pointer',
                    }}>+ Hoje</button>
                  </div>
                ))}
              </>
            )}

            {dailyItems.length === 0 && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 12, paddingBottom: 80
              }}>
                <div style={{ fontSize: 48 }}>📝</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Nenhuma tarefa diária</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>
                  Adicione uma tarefa do tipo "Dia a dia" e crie sub-itens nela.
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
