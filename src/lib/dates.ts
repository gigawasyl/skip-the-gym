export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const weekday = next.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  next.setDate(next.getDate() + mondayOffset);
  return next;
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function toDateInput(iso: string): string {
  const date = new Date(iso);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function toTimeInput(iso: string): string {
  const date = new Date(iso);
  return `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;
}

export function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isValidTimeInput(value: string): boolean {
  if (!/^\d{1,2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(':').map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

export function fromDateAndTime(dateValue: string, timeValue?: string): string {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hours, minutes] = (timeValue || '12:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0).toISOString();
}

export function formatDayHeading(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(start);
  const endLabel = new Intl.DateTimeFormat(undefined, {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
  }).format(end);
  return `${startLabel} – ${endLabel}`;
}
