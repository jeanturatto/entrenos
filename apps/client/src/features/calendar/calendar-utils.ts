import type { CalendarEvent } from '@/features/core/api';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const weekdayLabels = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'] as const;

export function startOfDay(value: Date) {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfWeek(value: Date) {
  const result = startOfDay(value);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

export function addDays(value: Date, amount: number) {
  const result = new Date(value);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(value: Date, amount: number) {
  const result = new Date(value);
  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export function dateKey(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(first: Date, second: Date) {
  return dateKey(first) === dateKey(second);
}

export function getMonthGridDays(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function getWeekDays(cursor: Date) {
  const first = startOfWeek(cursor);
  return Array.from({ length: 7 }, (_, index) => addDays(first, index));
}

export function getCalendarRange(view: CalendarViewMode, cursor: Date) {
  if (view === 'month') {
    const days = getMonthGridDays(cursor);
    return { from: days[0], to: addDays(days[days.length - 1], 1) };
  }

  if (view === 'week') {
    const from = startOfWeek(cursor);
    return { from, to: addDays(from, 7) };
  }

  if (view === 'day') {
    const from = startOfDay(cursor);
    return { from, to: addDays(from, 1) };
  }

  const from = startOfDay(cursor);
  return { from, to: addDays(from, 90) };
}

export function eventsForDay(events: CalendarEvent[], day: Date) {
  const from = startOfDay(day).getTime();
  const to = addDays(startOfDay(day), 1).getTime();
  return events.filter((event) => {
    const startsAt = new Date(event.starts_at).getTime();
    const endsAt = new Date(event.ends_at).getTime();
    return startsAt < to && endsAt > from;
  });
}

export function formatMonthTitle(value: Date) {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(value);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayHeading(value: Date) {
  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(value);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatShortDay(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(value)
    .replace('.', '');
}

export function formatEventTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(value),
  );
}

export function minutesFromStartOfDay(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

export function eventDurationMinutes(event: CalendarEvent) {
  return Math.max(
    20,
    Math.round((new Date(event.ends_at).getTime() - new Date(event.starts_at).getTime()) / 60_000),
  );
}
