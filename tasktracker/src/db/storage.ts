import { Preferences } from '@capacitor/preferences';
import { Task, TaskData } from '../types';

const TASKS_KEY = 'tasks';

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

export async function createTask(name: string, emoji: string, color: string): Promise<Task> {
  const data = await getAllData();
  const task: Task = {
    id: crypto.randomUUID(),
    name,
    emoji,
    color,
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
