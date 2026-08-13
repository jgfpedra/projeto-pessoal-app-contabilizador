import { useEffect, useState, useCallback } from 'react';
import { getTaskData, logTask, decrementLog, today } from '../db/storage';

interface Props {
  taskId: string;
  taskName: string;
  taskColor: string;
  onBack: () => void;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen({ taskId, taskName, taskColor, onBack }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [logs, setLogs] = useState<Record<string, number>>({});
  const todayStr = today();

  const reload = useCallback(async () => {
    const data = await getTaskData(taskId);
    setLogs(data?.logs ?? {});
  }, [taskId]);

  useEffect(() => { reload(); }, [reload]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    const n = new Date();
    if (year > n.getFullYear() || (year === n.getFullYear() && month >= n.getMonth() + 1)) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const handleTap = async (dateStr: string) => {
    if (dateStr > todayStr) return;
    await logTask(taskId, dateStr);
    reload();
  };

  const handleLongPress = async (dateStr: string) => {
    if (dateStr > todayStr) return;
    await decrementLog(taskId, dateStr);
    reload();
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [...Array(firstDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthLog = Object.entries(logs).filter(([d]) => d.startsWith(`${year}-${String(month).padStart(2, '0')}`));
  const activeDays = monthLog.length;
  const totalReps = monthLog.reduce((a, [, v]) => a + v, 0);
  const monthLabel = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getOpacity = (count: number) => count === 0 ? 0 : count === 1 ? 0.35 : count === 2 ? 0.6 : count === 3 ? 0.8 : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', color: 'var(--text)', fontSize: 22, padding: 4 }}>‹</button>
        <div style={{ flex: 1, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>{taskName}</div>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={prevMonth} style={{ background: 'none', color: 'var(--text)', fontSize: 22, padding: 8 }}>‹</button>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{monthLabel}</span>
          <button onClick={nextMonth} style={{ background: 'none', color: 'var(--text)', fontSize: 22, padding: 8 }}>›</button>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: taskColor }}>{activeDays}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>active days</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: taskColor }}>{totalReps}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>total reps</div>
          </div>
        </div>

        {/* Calendar grid */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const count = logs[dateStr] ?? 0;
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              const opacity = getOpacity(count);

              let longPressTimer: ReturnType<typeof setTimeout>;

              return (
                <div
                  key={dateStr}
                  onMouseDown={() => { longPressTimer = setTimeout(() => handleLongPress(dateStr), 500); }}
                  onMouseUp={() => clearTimeout(longPressTimer)}
                  onTouchStart={() => { longPressTimer = setTimeout(() => handleLongPress(dateStr), 500); }}
                  onTouchEnd={(e) => { clearTimeout(longPressTimer); if (!isFuture) { e.preventDefault(); } }}
                  onClick={() => handleTap(dateStr)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 6,
                    background: count > 0 ? taskColor : 'var(--card)',
                    opacity: count > 0 ? opacity : 1,
                    border: isToday ? `2px solid ${taskColor}` : '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: isFuture ? 'default' : 'pointer',
                    position: 'relative',
                  }}
                >
                  <span style={{
                    fontSize: 13,
                    color: count > 0 ? '#000' : isFuture ? 'var(--dim)' : isToday ? taskColor : 'var(--text)',
                    fontWeight: count > 0 || isToday ? 700 : 400,
                  }}>{day}</span>
                  {count > 1 && (
                    <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 8, color: '#00000099', fontWeight: 700 }}>{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--dim)' }}>Tap to log · Long press to remove</div>
      </div>
    </div>
  );
}
