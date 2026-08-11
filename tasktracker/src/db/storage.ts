import { Preferences } from '@capacitor/preferences';
import { Task, TaskData, DailyItem } from '../types';

const TASKS_KEY = 'tasks';
const DAILY_ITEMS_KEY = 'daily_items';
const DAILY_LOGS_KEY = 'daily_logs';

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

async function getAllData(): Promise<Record<string, TaskData>> {
  const { value } = await Preferences.get({ key: TASKS_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllData(data: Record<string, TaskData>): Promise<void> {
  await Preferences.set({ key: TASKS_KEY, value: JSON.stringify(data) });
}

export async function getTasks(): Promise<Task[]> {
  const data = await getAllData();
  return Object.values(data)
    .map(d => d.task)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTask(name: string, emoji: string, color: string, type: 'consistency' | 'daily' = 'consistency'): Promise<Task> {
  const data = await getAllData();
  const task: Task = {
    id: crypto.randomUUID(),
    name,
    emoji,
    color,
    type,
    createdAt: new Date().toISOString(),
  };
  data[task.id] = { task, logs: {} };
  await saveAllData(data);
  return task;
}

export async function updateTask(id: string, name: string, emoji: string, color: string): Promise<void> {
  const data = await getAllData();
  if (data[id]) {
    data[id].task = { ...data[id].task, name, emoji, color };
    await saveAllData(data);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const data = await getAllData();
  delete data[id];
  await saveAllData(data);
}

export async function getTaskData(id: string): Promise<TaskData | null> {
  const data = await getAllData();
  return data[id] ?? null;
}

export async function logTask(taskId: string, date: string): Promise<number> {
  const data = await getAllData();
  if (!data[taskId]) return 0;
  const current = data[taskId].logs[date] ?? 0;
  data[taskId].logs[date] = current + 1;
  await saveAllData(data);
  return current + 1;
}

export async function decrementLog(taskId: string, date: string): Promise<number> {
  const data = await getAllData();
  if (!data[taskId]) return 0;
  const current = data[taskId].logs[date] ?? 0;
  if (current <= 1) {
    delete data[taskId].logs[date];
    await saveAllData(data);
    return 0;
  }
  data[taskId].logs[date] = current - 1;
  await saveAllData(data);
  return current - 1;
}

export async function getAllTasksWithStats() {
  const data = await getAllData();
  const todayStr = today();
  return Object.values(data).map(({ task, logs }) => ({
    task,
    todayCount: logs[todayStr] ?? 0,
    streak: calcStreak(logs),
    totalDays: Object.keys(logs).length,
    totalReps: Object.values(logs).reduce((a, b) => a + b, 0),
  })).sort((a, b) => b.task.createdAt.localeCompare(a.task.createdAt));
}

export function calcStreak(logs: Record<string, number>): number {
  const dates = Object.keys(logs).sort().reverse();
  if (dates.length === 0) return 0;
  const todayStr = today();
  let streak = 0;
  let cursor = new Date(todayStr);

  for (let i = 0; i < 365; i++) {
    const dateStr = cursor.toISOString().split('T')[0];
    if (logs[dateStr]) {
      streak++;
    } else if (streak === 0 && dateStr === todayStr) {
      // today not logged yet, check yesterday
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getWeeklyStats(taskId: string): Promise<{ label: string; count: number }[]> {
  const data = await getAllData();
  const logs = data[taskId]?.logs ?? {};
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    result.push({ label, count: logs[dateStr] ?? 0, date: dateStr });
  }
  return result;
}

export async function getMonthlyStats(taskId: string): Promise<{ label: string; count: number }[]> {
  const data = await getAllData();
  const logs = data[taskId]?.logs ?? {};
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const weeks = [
    { label: 'W1', days: [1, 7] },
    { label: 'W2', days: [8, 14] },
    { label: 'W3', days: [15, 21] },
    { label: 'W4', days: [22, 31] },
  ];
  return weeks.map(({ label, days }) => {
    let count = 0;
    for (let d = days[0]; d <= days[1]; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      count += logs[dateStr] ?? 0;
    }
    return { label, count };
  });
}

// Backlog
async function getAllDailyItems(): Promise<Record<string, DailyItem>> {
  const { value } = await Preferences.get({ key: DAILY_ITEMS_KEY });
  return value ? JSON.parse(value) : {};
}

export async function getDailyItemsForTask(taskId: string): Promise<DailyItem[]> {
  const all = await getAllDailyItems();
  return Object.values(all).filter(i => i.taskId === taskId);
}

export async function createDailyItem(taskId: string, name: string): Promise<DailyItem> {
  const all = await getAllDailyItems();
  const item: DailyItem = { id: crypto.randomUUID(), taskId, name, createdAt: new Date().toISOString() };
  all[item.id] = item;
  await Preferences.set({ key: DAILY_ITEMS_KEY, value: JSON.stringify(all) });
  return item;
}

export async function deleteDailyItem(id: string): Promise<void> {
  const all = await getAllDailyItems();
  delete all[id];
  await Preferences.set({ key: DAILY_ITEMS_KEY, value: JSON.stringify(all) });
}

// Logs diários: quais itens foram selecionados hoje e se estão feitos
// shape: { [date]: { [itemId]: boolean } }
async function getAllDailyLogs(): Promise<Record<string, Record<string, boolean>>> {
  const { value } = await Preferences.get({ key: DAILY_LOGS_KEY });
  return value ? JSON.parse(value) : {};
}

export async function getDailyLogForDate(date: string): Promise<Record<string, boolean>> {
  const all = await getAllDailyLogs();
  return all[date] ?? {};
}

export async function setItemSelectedToday(itemId: string, date: string, selected: boolean): Promise<void> {
  const all = await getAllDailyLogs();
  if (!all[date]) all[date] = {};
  if (!selected) {
    delete all[date][itemId];
  } else {
    all[date][itemId] = all[date][itemId] ?? false; // preserva done se já existia
  }
  await Preferences.set({ key: DAILY_LOGS_KEY, value: JSON.stringify(all) });
}

export async function toggleDailyItemDone(itemId: string, date: string): Promise<void> {
  const all = await getAllDailyLogs();
  if (!all[date]) all[date] = {};
  all[date][itemId] = !all[date][itemId];
  await Preferences.set({ key: DAILY_LOGS_KEY, value: JSON.stringify(all) });
}
