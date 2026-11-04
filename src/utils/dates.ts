export function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function today(): string {
  return toDateStr(new Date());
}

export function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function addMinutes(isoStr: string, minutes: number): string {
  return new Date(new Date(isoStr).getTime() + minutes * 60000).toISOString();
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - d.getDay());
  return toDateStr(d);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isoFromDateAndTime(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local calendar date (YYYY-MM-DD) of an ISO instant, for <input type="date">. */
export function localDateFromIso(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local wall-clock time (HH:MM) of an ISO instant, for <input type="time">. */
export function localTimeFromIso(isoStr: string): string {
  const d = new Date(isoStr);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
