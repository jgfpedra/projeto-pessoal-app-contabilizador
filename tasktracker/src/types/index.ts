export interface Task {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface TaskLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface TaskData {
  task: Task;
  logs: Record<string, number>; // date -> count
}
