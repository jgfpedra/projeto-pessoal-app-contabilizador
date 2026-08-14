export interface Task {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  type: 'consistency' | 'daily';
}

export interface TaskLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface TaskData {
  task: Task;
  logs: Record<string, number>; // date -> count
}

export interface DailyItem {
  id: string;
  taskId: string;
  name: string;
  createdAt: string;
}
